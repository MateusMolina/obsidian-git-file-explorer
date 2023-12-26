import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { GitRepository } from "./gitRepository";
import { GitChangesComponent } from "./gitChangesComponent";
import { join } from "path";
import { GitSyncComponent } from "./gitSyncComponent";
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

			if (repo) new GitSyncComponent(folderItem.selfEl, repo).update();
			if (repo) new GitChangesComponent(folderItem.selfEl, repo).update();
		}
	}

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;

	private getFullPathFromFolderItem(folderItem: FolderItem): string {
		const folder = folderItem.file as TFolder;
		return join(this.vaultBasePath, folder.path);
	}
}

