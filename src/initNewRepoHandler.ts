import { Menu, MenuItem, TFolder } from "obsidian";
import { GitRepository } from "./git/gitRepository";
import { join } from "path";

export class InitNewRepoHandler {
	private static INIT_NEW_REPO = "Init git repository";
	private afterInitCallback: (initializedRepo: GitRepository) => void;

	constructor(private basePath: string) {}

	withCallback = (callback: (initializedRepo: GitRepository) => void) => {
		this.afterInitCallback = callback;
		return this;
	};

	public install = (menu: Menu, folder: TFolder) => {
		menu.addItem((item: MenuItem) => {
			item.setTitle(InitNewRepoHandler.INIT_NEW_REPO)
				.setIcon("git-branch") 
				.onClick((e) => {
					this.afterInitCallback(this.initGitRepository(folder.path));
				});
		});
	};
	private initGitRepository = (folderPath: string) =>
		GitRepository.initGitRepo(this.buildAbsPathTo(folderPath));

	private buildAbsPathTo = (path: string) => join(this.basePath, path);
}
