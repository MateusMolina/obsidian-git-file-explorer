import { Plugin, FileExplorer, FileSystemAdapter } from "obsidian";
import { GitHandler } from "./src/gitHandler";
import { FileExplorerUpdater } from "./src/fileExplorerUpdater";

interface GitFileExplorerPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GitFileExplorerPluginSettings = {
	mySetting: "default",
};
export default class GitFileExplorerPlugin extends Plugin {
	gitHandler: GitHandler;
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

		this.gitHandler = new GitHandler(this.getVaultBasePath());
		this.fileExplorerUpdater = new FileExplorerUpdater(
			this.gitHandler,
			this.fileExplorer
		);

		this.fileExplorerUpdater.updateFileExplorer();
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
}
