import { Plugin, FileExplorer, FileSystemAdapter } from "obsidian";
import { FileExplorerUpdater } from "./src/fileExplorerUpdater";

interface GitFileExplorerPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GitFileExplorerPluginSettings = {
	mySetting: "default",
};
export default class GitFileExplorerPlugin extends Plugin {
	fileExplorer?: FileExplorer | null;
	fileExplorerUpdater: FileExplorerUpdater;
	settings: GitFileExplorerPluginSettings;

	async onload() {
		await this.loadSettings();
		this.app.workspace.onLayoutReady(this.initialize);
	}

	initialize = async () => {
		this.fileExplorer = this.retrieveFileExplorer();

		if (!this.fileExplorer) return;

		this.fileExplorerUpdater = new FileExplorerUpdater(
			this.getVaultBasePath(),
			this.fileExplorer
		);

		this.fileExplorerUpdater.updateFileExplorer();
		this.registerEventListeners(
			this.fileExplorerUpdater.updateFileExplorer.bind(
				this.fileExplorerUpdater
			)
		);
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
	}

	private retrieveFileExplorer(): FileExplorer | null {
		const fileExplorer =
			this.app.workspace.getLeavesOfType("file-explorer");
		if (fileExplorer.length === 0) {
			console.error("File explorer not found.");
			return null;
		}

		return fileExplorer[0].view as FileExplorer;
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
