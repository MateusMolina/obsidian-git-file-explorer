import { FileExplorerHandler } from "../fileExplorerHandler";
import { GitWidgetFactory } from "./gitWidgetFactory";
import { Widget } from "./widget";
import { FolderItem } from "obsidian";

export class WidgetManager {
	private widgets: Widget[] = [];

	constructor(private fileExplorerHandler: FileExplorerHandler) {
		this.update = this.update.bind(this);
	}

	public async update(): Promise<void> {
		await this.addWidgetsForNewFolderItems();
		await this.updateExistingWidgets();
	}

	private updateExistingWidgets = async () =>
		await Promise.all(this.widgets.map((w) => w.update()));

	private addWidgetsForNewFolderItems = async () =>
		this.fileExplorerHandler.doWithFolderItem(async (folderItem) => {
			if (this.isNewFolderItem(folderItem))
				await this.createWidgetsForFolderItem(folderItem);
		});

	private isNewFolderItem = (folderItem: FolderItem) =>
		!this.widgets.some((widget) =>
			widget.getParent().isEqualNode(folderItem.selfEl)
		);

	private async createWidgetsForFolderItem(
		folderItem: FolderItem
	): Promise<void> {
		try {
			const factory = await GitWidgetFactory.getInstance(
				folderItem.selfEl,
				this.fileExplorerHandler.getFullPathToItem(folderItem)
			);

			this.widgets.push(...factory.createWidgetsBundle());
		} catch (err) {
			return;
		}
	}
}
