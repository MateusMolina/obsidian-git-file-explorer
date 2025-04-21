import { TFile, TFolder } from "obsidian";
import { GitRepository } from "./git/gitRepository";
import { join } from "path";
import { CapabilityProvider } from "./capabilityProvider";

export class InitNewRepoHandler implements CapabilityProvider {
	private static INIT_NEW_REPO = "Init git repository";
	private static COMMAND_ID = "init-git-repo-active-folder";
	private afterInitCallback: (initializedRepo: GitRepository) => void;

	constructor(private basePath: string) {}

	withCallback = (callback: (initializedRepo: GitRepository) => void) => {
		this.afterInitCallback = callback;
		return this;
	};

	public async execute(fileOrFolder: TFile | TFolder): Promise<void> {
		// For files, we initialize in the parent folder
		if (fileOrFolder instanceof TFile) {
			const folder = fileOrFolder.parent;
			if (!folder) return;
			
			// Check if it's already a git repo
			const absPath = this.buildAbsPathTo(folder.path);
			if (GitRepository.isGitRepo(absPath)) return;
			
			this.initAndNotify(folder);
		} else {
			// For folders, check directly
			const absPath = this.buildAbsPathTo(fileOrFolder.path);
			if (GitRepository.isGitRepo(absPath)) return;
			
			this.initAndNotify(fileOrFolder);
		}
	}

	private initAndNotify(folder: TFolder): GitRepository {
		const repo = this.initGitRepository(folder.path);
		if (this.afterInitCallback) {
			this.afterInitCallback(repo);
		}
		return repo;
	}

	public getCommandName(): string {
		return InitNewRepoHandler.INIT_NEW_REPO;
	}

	public getIcon(): string {
		return "git-branch";
	}
	
	public getCommandId(): string {
		return InitNewRepoHandler.COMMAND_ID;
	}
	
	private initGitRepository = (folderPath: string) =>
		GitRepository.initGitRepo(this.buildAbsPathTo(folderPath));

	private buildAbsPathTo = (path: string) => join(this.basePath, path);
}
