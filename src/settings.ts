import GitFileExplorerPlugin from "./../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface GitFileExplorerPluginSettings {
	gitChangesWidgetActive: boolean;
	enableNavColorUpdater: boolean;
	promptCommitMsg: boolean;
	gitSyncWidgetActive: boolean;
}

export const DEFAULT_SETTINGS: Partial<GitFileExplorerPluginSettings> = {
	promptCommitMsg: true,
	enableNavColorUpdater: true,
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
			.setName("Activate git changes widget")
			.setDesc(
				"Show a widget in the file explorer with a counter of the current staged and unstaged changes"
			)
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
			.setName("Enable prompting commit message")
			.setDesc(
				"Prompt for a commit message when saving a file. If disabled, the commit message is in the format 'Backup @ {iso-timestamp}'"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.promptCommitMsg)
					.onChange(async (value) => {
						this.plugin.settings.promptCommitMsg = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Change color of changed files in the file explorer")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableNavColorUpdater)
					.onChange(async (value) => {
						this.plugin.settings.enableNavColorUpdater = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Activate git sync widget")
			.setDesc(
				"Show a widget in the file explorer with a button to sync with the remote repository"
			)
			.setHeading()
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.gitSyncWidgetActive)
					.onChange(async (value) => {
						this.plugin.settings.gitSyncWidgetActive = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl
			.createEl("p")
			.createEl("i")
			.setText("Changes require restarting Obsidian");

		this.containerEl.createEl("h2", {
			text: "About",
		});

		const paragraph = containerEl.createEl("small");
		paragraph.setText("Made with ☕ by ");
		paragraph
			.createEl("a", {
				href: "https://mateusmolina.github.io",
			})
			.setText("Mateus Molina");
	}
}
