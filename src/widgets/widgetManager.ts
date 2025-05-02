import { FileExplorerHandler } from "../fileExplorerHandler";
import { GitWidgetFactory } from "./gitWidgetFactory";
import { Widget } from "./widget";
import { AFItem, FolderItem } from "obsidian";
import { join } from "path";
import { SmartDebouncer } from "./utils/smartDebouncer";
import { GitEventBus } from "./utils/eventBus";

export class WidgetManager {
	private widgets: Widget[] = [];
	private smartDebouncer: SmartDebouncer = new SmartDebouncer(1500);
	private eventBus: GitEventBus = GitEventBus.getInstance();

	constructor(
		private factory: GitWidgetFactory,
		private fileExplorerHandler: FileExplorerHandler,
		private basePath: string
	) {
		this.update = this.update.bind(this);
	}

	public async update(): Promise<void> {
		this.smartDebouncer.debounce("*", async () => {
			await this.addWidgetsForNewFolderItems();
			await this.updateExistingWidgets();
		});
	}

	public uninstallAll = () => {
		this.eventBus.clearListeners();
		
		this.smartDebouncer.clearAll();
		
		this.widgets.forEach((widget) => widget.uninstall());
		this.widgets = [];
	}

	private updateExistingWidgets = async () => {
		await Promise.all(this.widgets.map((widget) => widget.update()));
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
			
			if (widgets.length > 0) {
				this.widgets.push(...widgets);
				
				widgets.forEach(widget => {
					this.eventBus.subscribe(absPathToFolder, (updatedRepoPath) => {
						this.smartDebouncer.debounce(updatedRepoPath, async () => {
							await widget.update();
						});
					});
				});
			}
		} catch (err) {
			return;
		}
	}

	private getFullPathToItem(item: AFItem): string {
		return join(this.basePath, item.file.path);
	}
}
