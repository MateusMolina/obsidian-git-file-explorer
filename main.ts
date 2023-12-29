import { Plugin, FileExplorer, FileSystemAdapter } from "obsidian";
import { FileExplorerHandler } from "./src/fileExplorerHandler";
import { WidgetManager } from "src/widgets/widgetManager";
import { GitWidgetFactory } from "src/widgets/gitWidgetFactory";
import {
	DEFAULT_SETTINGS,
	GitFileExplorerPluginSettings,
	GitFileExplorerSettingTab,
} from "./src/settings";

export default class GitFileExplorerPlugin extends Plugin {
	fileExplorer?: FileExplorer | null;
	fileExplorerHandler: FileExplorerHandler;
	widgetManager: WidgetManager;
	settings: GitFileExplorerPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GitFileExplorerSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.initialize);
	}

	initialize = async () => {
		this.fileExplorerHandler = new FileExplorerHandler(this.app);

		if (!this.fileExplorerHandler.fileExplorer) return;

		this.widgetManager = new WidgetManager(
			new GitWidgetFactory(this.app),
			this.fileExplorerHandler,
			this.getVaultBasePath()
		);

		await this.widgetManager.update();

		this.registerEventListeners(this.widgetManager.update);
	};

	onunload() {
		console.log("Unloading GitFileExplorerPlugin");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.initialize();
	}

	private getVaultBasePath(): string {
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			return adapter.getBasePath();
		}
		return "";
	}

	private registerEventListeners(callback: () => void) {
		this.registerEvent(this.app.vault.on("create", callback));
		this.registerEvent(this.app.vault.on("delete", callback));
		this.registerEvent(this.app.vault.on("rename", callback));
		this.registerEvent(this.app.vault.on("modify", callback));
	}
}
