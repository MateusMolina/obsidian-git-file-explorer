import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { GitHandler } from "./gitHandler";
import { GitFEComponent } from "./gitFEComponent";

export class FileExplorerUpdater {
	private gitHandler: GitHandler;
	private fileExplorer: FileExplorer;

	constructor(gitHandler: GitHandler, fileExplorer: FileExplorer) {
		this.gitHandler = gitHandler;
		this.fileExplorer = fileExplorer;
	}

	public async updateFileExplorer() {
		const folderItems = Object.values(this.fileExplorer.fileItems).filter(
			this.isFolder
		) as FolderItem[];

		for (const folderItem of folderItems) {
			const folder = folderItem.file as TFolder;
			if (await this.gitHandler.isGitRepo(folder.path)) {
				new GitFEComponent(
					folderItem.selfEl,
					folder.path,
					this.gitHandler
				).update();
			}
		}
	}

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;
}
