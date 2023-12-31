import { FileExplorer, AFItem, TFolder, FolderItem, App } from "obsidian";
export class FileExplorerHandler {
	public fileExplorer?: FileExplorer;

	constructor(app: App) {
		this.fileExplorer = FileExplorerHandler.retrieveFileExplorer(app);
	}

	doWithFolderItem = async (func: (f: FolderItem) => void | Promise<void>) =>
		Promise.all(
			Object.values(this.fileExplorer?.fileItems ?? {})
				.filter(this.isFolder)
				.map(func)
		);

	private isFolder = (item: AFItem): item is FolderItem =>
		(item as FolderItem).file instanceof TFolder;

	static retrieveFileExplorer(app: App): FileExplorer | undefined {
		const fileExplorer = app.workspace.getLeavesOfType("file-explorer");
		if (fileExplorer.length === 0) {
			console.error("File explorer not found.");
			return undefined;
		}

		return fileExplorer[0].view as FileExplorer;
	}
}
