import { Plugin, FileExplorer, FileSystemAdapter } from "obsidian";
import { FileExplorerHandler } from "./src/fileExplorerHandler";
import { WidgetManager } from "src/widgets/widgetManager";
import { GitWidgetFactory } from "src/widgets/gitWidgetFactory";
import {
	DEFAULT_SETTINGS,
	GitFileExplorerPluginSettings,
	GitFileExplorerSettingTab,
} from "./src/settings";
import { InitNewRepoHandler } from "src/initNewRepoHandler";
import { GitDiffHandler } from "src/gitDiffHandler";
import { ContextMenuInstaller } from "src/contextMenuInstaller";
import { CommandRegister } from "src/commandRegister";
import { CapabilityProvider } from "src/capabilityProvider";

export default class GitFileExplorerPlugin extends Plugin {
	settings: GitFileExplorerPluginSettings;
	widgetManager: WidgetManager;
	fileExplorerHandler: FileExplorerHandler;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GitFileExplorerSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.initialize);
	}

	initialize = async () => {
		this.fileExplorerHandler = new FileExplorerHandler(this.app);

		if (!this.fileExplorerHandler.fileExplorer) return;

		this.widgetManager = new WidgetManager(
			new GitWidgetFactory(this.app, this.settings),
			this.fileExplorerHandler,
			this.getVaultBasePath()
		);

		await this.widgetManager.update();

		this.registerEventListeners(this.widgetManager.update);

		const capabilityProviders: CapabilityProvider[] = [
			new GitDiffHandler(this.getVaultBasePath())
				.withCallback(() => this.widgetManager?.update()),
			new InitNewRepoHandler(this.getVaultBasePath())
				.withCallback(() => this.widgetManager?.update())
		];

		const contextMenuInstaller = new ContextMenuInstaller(this);
		
		const commandRegister = new CommandRegister(this);
		
		capabilityProviders.forEach(provider => {
			contextMenuInstaller.installContextMenu(provider);
			commandRegister.registerCommandForActiveFile(provider);
		});
	};

	onunload() {
		console.log("Unloading GitFileExplorerPlugin");
		this.widgetManager.uninstallAll();
		this.deregisterEventListeners(this.widgetManager.update);
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
		this.fileExplorerHandler.fileExplorer?.containerEl.addEventListener(
			"click",
			callback
		);
	}

	private deregisterEventListeners(callback: () => void) {
		this.fileExplorerHandler.fileExplorer?.containerEl.removeEventListener(
			"click",
			callback
		);
	}
}
