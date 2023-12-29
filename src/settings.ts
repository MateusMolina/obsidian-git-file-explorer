import { link } from "fs";
import GitFileExplorerPlugin from "./../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface GitFileExplorerPluginSettings {
	promptCommitMsg: boolean;
	gitChangesWidgetActive: boolean;
	gitSyncWidgetActive: boolean;
}

export const DEFAULT_SETTINGS: Partial<GitFileExplorerPluginSettings> = {
	promptCommitMsg: true,
	gitChangesWidgetActive: true,
	gitSyncWidgetActive: true,
};

export class GitFileExplorerSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: GitFileExplorerPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		new Setting(containerEl)
			.setName("Git changes widget active")
			.setHeading()
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.gitChangesWidgetActive)
					.onChange(async (value) => {
						this.plugin.settings.gitChangesWidgetActive = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Prompt commit message")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.promptCommitMsg)
					.onChange(async (value) => {
						this.plugin.settings.promptCommitMsg = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Git sync widget active")
			.setHeading()
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.gitSyncWidgetActive)
					.onChange(async (value) => {
						this.plugin.settings.gitSyncWidgetActive = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("p").innerHTML =
			"<i>Changes require restarting Obsidian</i>";

		this.containerEl.createEl("h2", {
			text: "About",
		});

		containerEl.createEl("p").innerHTML =
			"Made with ☕ by <a href='https://mateusmolina.github.io'>Mateus Molina</a>";
	}
}
