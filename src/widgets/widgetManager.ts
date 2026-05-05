import { FileExplorerHandler } from "../fileExplorerHandler";
import { GitWidgetFactory } from "./gitWidgetFactory";
import { Widget } from "./widget";
import { AFItem, FolderItem } from "obsidian";
import { join } from "path";
import { existsSync } from "fs";
import { SmartDebouncer } from "./utils/smartDebouncer";
import { GitEventBus } from "./utils/eventBus";

export class WidgetManager {
	private widgets: Widget[] = [];
	private smartDebouncer: SmartDebouncer = new SmartDebouncer(3000);
	private eventBus: GitEventBus = GitEventBus.getInstance();

	constructor(
		private factory: GitWidgetFactory,
		private fileExplorerHandler: FileExplorerHandler,
		private basePath: string
	) {
		this.update = this.update.bind(this);
	}

	public initializeRoot = async () => {
		if (!existsSync(join(this.basePath, ".git"))) return;

		const rootEl = this.createRootWidgetContainer();
		if (!rootEl) return;

		const alreadyWidgetized = this.widgets.some((widget) =>
			widget.getParent().isEqualNode(rootEl)
		);
		if (alreadyWidgetized) return;

		await this.registerWidgets(rootEl, this.basePath);
	};

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
				await this.registerWidgets(folderItem.selfEl, this.getFullPathToItem(folderItem));
			});

	private isNewFolderItem = (folderItem: FolderItem) =>
		!this.widgets.some((widget) =>
			widget.getParent().isEqualNode(folderItem.selfEl)
		);

	private async registerWidgets(parent: HTMLElement, absPath: string): Promise<void> {
		try {
			const widgets = await this.factory.buildWidgets(parent, absPath);

			if (widgets.length > 0) {
				this.widgets.push(...widgets);

				widgets.forEach(widget => {
					this.eventBus.subscribe(absPath, (updatedRepoPath) => {
						this.smartDebouncer.debounce(updatedRepoPath+"-"+widget.getName(), async () => {
							await widget.update();
						});
					});
				});
			}
		} catch (err) {
			return;
		}
	}

	private createRootWidgetContainer(): HTMLElement | undefined {
		const existing = document.querySelector<HTMLElement>('#git-root-widget-container');
		if (existing) return existing;

		const vaultProfile = document.querySelector<HTMLElement>('.workspace-sidedock-vault-profile');
		if (!vaultProfile) return undefined;

		const rootEl = document.createElement('div');
		rootEl.id = 'git-root-widget-container';
		rootEl.setAttribute('data-path', '/');

		const vaultActions = vaultProfile.querySelector('.workspace-drawer-vault-actions');
		vaultProfile.insertBefore(rootEl, vaultActions);

		return rootEl;
	}

	private getFullPathToItem(item: AFItem): string {
		return join(this.basePath, item.file.path);
	}
}
