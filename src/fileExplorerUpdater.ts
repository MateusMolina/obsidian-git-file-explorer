import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { GitHandler } from "./gitHandler";

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
				const changedFilesCount =
					await this.gitHandler.getChangedFilesCount(folder.path);
				this.appendTextToFolderItem(folderItem, changedFilesCount);
			}
		}
	}

	private appendTextToFolderItem(folder: FolderItem, text: string | number) {
		const countEl = document.createElement("span");
		countEl.textContent = `  (${text})`;
		folder.selfEl.appendChild(countEl);
	}

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;
}