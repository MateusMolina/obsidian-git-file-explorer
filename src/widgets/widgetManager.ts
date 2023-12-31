import { FileExplorerHandler } from "../fileExplorerHandler";
import { GitWidgetFactory } from "./gitWidgetFactory";
import { Widget } from "./widget";
import { AFItem, FolderItem } from "obsidian";
import { Debouncer } from "./utils/debouncer";
import { join } from "path";

export class WidgetManager {
	private widgets: Widget[] = [];
	private debouncer: Debouncer = new Debouncer(1500);

	constructor(
		private factory: GitWidgetFactory,
		private fileExplorerHandler: FileExplorerHandler,
		private basePath: string
	) {
		this.update = this.update.bind(this);
	}

	public async update(): Promise<void> {
		this.debouncer.debounceAndRunWhenIdle(this.updateNow.bind(this));
	}

	public uninstallAll = () =>
		this.widgets.forEach((widget) => widget.uninstall());

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
		await this.fileExplorerHandler.doWithFolderItem(async (folderItem) => {
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
			const parent = folderItem.selfEl;
			const absPathToFolder = this.getFullPathToItem(folderItem);
			const widgets = await this.factory.buildWidgets(
				parent,
				absPathToFolder
			);
			this.widgets.push(...widgets);
		} catch (err) {
			return;
		}
	}

	private getFullPathToItem(item: AFItem): string {
		return join(this.basePath, item.file.path);
	}
}
