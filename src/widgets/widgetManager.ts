import { FileExplorerHandler } from "../fileExplorerHandler";
import { GitWidgetFactory } from "./gitWidgetFactory";
import { Widget } from "./widget";
import { App, FolderItem } from "obsidian";
import { Debouncer } from "./utils/debouncer";

export class WidgetManager {
	private widgets: Widget[] = [];
	private debouncer: Debouncer = new Debouncer(3000);

	constructor(
		private app: App,
		private fileExplorerHandler: FileExplorerHandler
	) {
		this.update = this.update.bind(this);
	}

	public async update(): Promise<void> {
		this.debouncer.debounceAndRunWhenIdle(this.updateNow.bind(this));
	}

	private async updateNow() {
		await this.addWidgetsForNewFolderItems();
		await this.updateExistingWidgets();
	}

	private updateExistingWidgets = async () => {
		for (const widget of this.widgets) {
			await widget.update();
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	};

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
				this.app,
				folderItem.selfEl,
				this.fileExplorerHandler.getFullPathToItem(folderItem)
			);

			this.widgets.push(...factory.createWidgetsBundle());
		} catch (err) {
			return;
		}
	}
}
