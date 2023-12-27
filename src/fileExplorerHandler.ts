import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { join } from "path";
export class FileExplorerHandler {
	private vaultBasePath: string;
	private fileExplorer: FileExplorer;

	constructor(vaultBasePath: string, fileExplorer: FileExplorer) {
		this.vaultBasePath = vaultBasePath;
		this.fileExplorer = fileExplorer;
	}

	doWithFolderItem = async (func: (f: FolderItem) => Promise<void>) => {
		await Promise.all(
			Object.values(this.fileExplorer.fileItems)
				.filter(this.isFolder)
				.map(func)
		);
	};
	getFullPathToItem(item: AFItem): string {
		return join(this.vaultBasePath, item.file.path);
	}

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;
}
