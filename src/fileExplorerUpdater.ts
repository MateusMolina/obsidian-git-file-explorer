import { FileExplorer, AFItem, TFolder, FolderItem } from "obsidian";
import { join } from "path";
import { GitWidgetFactory } from "./widgets/gitWidgetFactory";
export class FileExplorerHandler {
	private vaultBasePath: string;
	private fileExplorer: FileExplorer;

	constructor(vaultBasePath: string, fileExplorer: FileExplorer) {
		this.vaultBasePath = vaultBasePath;
		this.fileExplorer = fileExplorer;
	}

	public async updateFileExplorer() {
		this.doWithFolderItem((f) =>
			GitWidgetFactory.getInstance(f.selfEl, this.getFullPathToItem(f))
				.then((factory) => {
					factory.createSyncGitWidget().update();
					factory.createChangesGitWidget().update();
				})
				.catch((err) => {})
		);
	}

	doWithFolderItem = (func: (f: FolderItem) => void) =>
		Object.values(this.fileExplorer.fileItems)
			.filter(this.isFolder)
			.forEach(func);

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;

	private getFullPathToItem(item: AFItem): string {
		return join(this.vaultBasePath, item.file.path);
	}
}
