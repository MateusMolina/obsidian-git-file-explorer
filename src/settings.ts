import GitFileExplorerPlugin from "./../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface GitFileExplorerPluginSettings {
	gitChangesWidgetActive: boolean;
	enableNavColorUpdater: boolean;
	promptCommitMsg: boolean;
	gitSyncWidgetActive: boolean;
	navColorStyle: "colored-text" | "margin-highlight";
	autoSyncEnabled: boolean;
	autoSyncOnStartup: boolean;
	autoSyncFrequency: number;
}

export const DEFAULT_SETTINGS: Partial<GitFileExplorerPluginSettings> = {
	promptCommitMsg: true,
	enableNavColorUpdater: true,
	gitChangesWidgetActive: true,
	gitSyncWidgetActive: true,
	navColorStyle: "colored-text",
	autoSyncEnabled: false,
	autoSyncOnStartup: true,
	autoSyncFrequency: 30,
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
			.setName("Changed files style")
			.setDesc("Choose how changed files should be highlighted in the file explorer")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("colored-text", "Colored text")
					.addOption("margin-highlight", "Margin highlight + colored text")
					.setValue(this.plugin.settings.navColorStyle)
					.onChange(async (value: "colored-text" | "margin-highlight") => {
						this.plugin.settings.navColorStyle = value;
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

		new Setting(containerEl)
			.setName("Enable auto-sync")
			.setDesc(
				"Enable automatic syncing with remote repositories"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoSyncEnabled)
					.onChange(async (value) => {
						this.plugin.settings.autoSyncEnabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto-sync on startup")
			.setDesc(
				"Automatically sync repositories when Obsidian starts"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoSyncOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.autoSyncOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto-sync frequency (minutes)")
			.setDesc(
				"How often to automatically sync repositories (0 to disable periodic sync)"
			)
			.addSlider((slider) =>
				slider
					.setLimits(0, 120, 5)
					.setValue(this.plugin.settings.autoSyncFrequency)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.autoSyncFrequency = value;
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
				href: "https://blog.mmolina.me",
			})
			.setText("Mateus Molina");
	}
}
