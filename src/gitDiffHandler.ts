import { Menu, MenuItem, TFile, TFolder } from "obsidian";
import { GitRepository } from "./git/gitRepository";
import { join } from "path";

export class GitDiffHandler {
	private static OPEN_GIT_DIFF = "Open git diff tool";
	private afterDiffCallback: () => void;

	constructor(private basePath: string) {}

	withCallback = (callback: () => void) => {
		this.afterDiffCallback = callback;
		return this;
	};

	public install = (menu: Menu, fileOrFolder: TFile | TFolder) => {
		const folderPath = fileOrFolder instanceof TFolder ? fileOrFolder.path : fileOrFolder.parent?.path;
		if (!folderPath) return;

		const absPath = this.buildAbsPathTo(folderPath);
		
		// Check if this file/folder is within a git repository
		const repoRoot = this.findGitRepoRoot(absPath);
		if (!repoRoot) return; 
		
		menu.addItem((item: MenuItem) => {
			item.setTitle(GitDiffHandler.OPEN_GIT_DIFF)
				.setIcon("git-pull-request") 
				.onClick(async () => {
				try {
					const normalizedRepoRoot = repoRoot;
					const normalizedTargetPath = this.buildAbsPathTo(fileOrFolder.path);
					
					// Get the path relative to the repository root
					let relativePath = "";
					if (normalizedTargetPath.startsWith(normalizedRepoRoot)) {
						relativePath = normalizedTargetPath.substring(normalizedRepoRoot.length);
						// Remove leading slash if present
						if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
							relativePath = relativePath.substring(1);
						}
					}
					
					console.log(`Opening git diff for: ${relativePath} in repository: ${repoRoot}`);
					
					await GitRepository.openDiff(repoRoot, relativePath);
					
					if (this.afterDiffCallback) {
						this.afterDiffCallback();
					}
				} catch (error) {
					console.error("Failed to open git diff tool:", error);
				}
			});
		});
	};

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
}