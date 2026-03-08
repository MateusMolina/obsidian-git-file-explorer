import { TFile, TFolder } from "obsidian";
import { GitRepository } from "./git/gitRepository";
import { join } from "path";
import { CapabilityProvider } from "./capabilityProvider";

export class ViewRemoteHandler implements CapabilityProvider {
	private static VIEW_REMOTE = "View remote";
	private static COMMAND_ID = "view-remote-repo";

	constructor(private basePath: string) {}

	public async execute(fileOrFolder: TFile | TFolder): Promise<void> {
		// First check if this is applicable (within a git repository)
		const folderPath = fileOrFolder instanceof TFolder ? fileOrFolder.path : fileOrFolder.parent?.path;
		if (!folderPath) return;

		const absPath = this.buildAbsPathTo(folderPath);
		
		// Check if this file/folder is within a git repository
		const repoRoot = this.findGitRepoRoot(absPath);
		if (!repoRoot) return;
		
		try {
			const gitRepo = await GitRepository.getInstance(repoRoot);
			
			// Check if repository has a remote
			if (!(await gitRepo.hasRemote())) {
				console.log("No remote repository configured");
				return;
			}

			// Get the remote URL
			const remoteUrl = await this.getRemoteUrl(repoRoot);
			if (!remoteUrl) {
				console.log("Could not determine remote URL");
				return;
			}

			// Convert git URL to web URL if needed
			const webUrl = this.convertToWebUrl(remoteUrl);
			
			console.log(`Opening remote repository: ${webUrl}`);
			
			// Open the URL in the default browser
			window.open(webUrl, '_blank');
			
		} catch (error) {
			console.error("Failed to open remote repository:", error);
		}
	}

	public getCommandName(): string {
		return ViewRemoteHandler.VIEW_REMOTE;
	}

	public getIcon(): string {
		return "external-link";
	}
	
	public getCommandId(): string {
		return ViewRemoteHandler.COMMAND_ID;
	}

	private buildAbsPathTo = (path: string) => join(this.basePath, path);
	
	// Find the git repository root by walking up the directory tree
	private findGitRepoRoot(startPath: string): string | null {
		let currentPath = startPath;
		
		while (currentPath && currentPath.length > 0) {
			if (GitRepository.isGitRepo(currentPath)) {
				return currentPath;
			}
			
			// Go up one directory
			const parentPath = join(currentPath, "..");
			
			// If we're at the root, stop searching
			if (parentPath === currentPath) {
				return null;
			}
			
			currentPath = parentPath;
		}
		
		return null;
	}

	private async getRemoteUrl(repoPath: string): Promise<string | null> {
		try {
			const { exec } = require('child_process');
			const { promisify } = require('util');
			const execAsync = promisify(exec);
			
			const { stdout } = await execAsync('git remote get-url origin', { cwd: repoPath });
			return stdout.trim();
		} catch (error) {
			console.error("Error getting remote URL:", error);
			return null;
		}
	}

	private convertToWebUrl(gitUrl: string): string {
		// Handle SSH URLs (git@github.com:user/repo.git)
		if (gitUrl.startsWith('git@')) {
			const sshMatch = gitUrl.match(/git@([^:]+):(.+)\.git$/);
			if (sshMatch) {
				return `https://${sshMatch[1]}/${sshMatch[2]}`;
			}
		}
		
		// Handle HTTPS URLs (https://github.com/user/repo.git)
		if (gitUrl.startsWith('https://')) {
			return gitUrl.replace(/\.git$/, '');
		}
		
		// Return as-is if we can't parse it
		return gitUrl;
	}
}
