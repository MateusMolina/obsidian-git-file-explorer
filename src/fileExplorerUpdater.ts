import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { GitRepository } from "./git/gitRepository";
import { ChangesGitWidget } from "./widgets/changesGitWidget";
import { join } from "path";
import { SyncGitWidget } from "./widgets/syncGitWidget";
export class FileExplorerUpdater {
	private vaultBasePath: string;
	private fileExplorer: FileExplorer;

	constructor(vaultBasePath: string, fileExplorer: FileExplorer) {
		this.vaultBasePath = vaultBasePath;
		this.fileExplorer = fileExplorer;
	}

	public async updateFileExplorer() {
		const folderItems = Object.values(this.fileExplorer.fileItems).filter(
			this.isFolder
		) as FolderItem[];

		for (const folderItem of folderItems) {
			const repo = await GitRepository.getInstance(
				this.getFullPathFromFolderItem(folderItem)
			).catch((error) => {
				return;
			});

			if (repo) new SyncGitWidget(folderItem.selfEl, repo).update();
			if (repo) new ChangesGitWidget(folderItem.selfEl, repo).update();
		}
	}

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;

	private getFullPathFromFolderItem(folderItem: FolderItem): string {
		const folder = folderItem.file as TFolder;
		return join(this.vaultBasePath, folder.path);
	}
}

