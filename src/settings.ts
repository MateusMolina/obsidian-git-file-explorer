import GitFileExplorerPlugin from "./../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface GitFileExplorerPluginSettings {
	gitChangesWidgetActive: boolean;
	enableNavColorUpdater: boolean;
	promptCommitMsg: boolean;
	gitSyncWidgetActive: boolean;
	navColorStyle: "colored-text" | "margin-highlight";
	autoSyncOnStartup: boolean;
	autoSyncFrequency: number;
	syncStartupDelay: number;
	syncRetryCount: number;
	syncRetryDelay: number;
}

export const DEFAULT_SETTINGS: Partial<GitFileExplorerPluginSettings> = {
	promptCommitMsg: true,
	enableNavColorUpdater: true,
	gitChangesWidgetActive: true,
	gitSyncWidgetActive: true,
	navColorStyle: "colored-text",
	autoSyncOnStartup: false,
	autoSyncFrequency: 0,
	syncStartupDelay: 0,
	syncRetryCount: 3,
	syncRetryDelay: 1,
};

export class GitFileExplorerSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: GitFileExplorerPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		
		let gitChangesSettingsContainer: HTMLElement;

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
						
						this.renderGitChangesSettings(gitChangesSettingsContainer, value);
					})
			);

		gitChangesSettingsContainer = containerEl.createDiv();

		this.renderGitChangesSettings(gitChangesSettingsContainer, this.plugin.settings.gitChangesWidgetActive);

		let autoSyncSettingsContainer: HTMLElement;

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
						
						this.renderAutoSyncSettings(autoSyncSettingsContainer, value);
					})
			);

		autoSyncSettingsContainer = containerEl.createDiv();

		this.renderAutoSyncSettings(autoSyncSettingsContainer, this.plugin.settings.gitSyncWidgetActive);

		containerEl
			.createEl("p")
			.createEl("i")
			.setText("Changes require restarting Obsidian");

		this.containerEl.createEl("h2", {
			text: "About",
		});

		const paragraph = containerEl.createEl("small");
		paragraph.setText("See list of ");
		paragraph
			.createEl("a", {
				href: "https://github.com/MateusMolina/obsidian-git-file-explorer/graphs/contributors",
			})
			.setText("contributors");
	}

	private renderGitChangesSettings(container: HTMLElement, isVisible: boolean): void {
		container.empty();
		
		if (isVisible) {
			new Setting(container)
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

			new Setting(container)
				.setName("Change color of changed files in the file explorer")
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.enableNavColorUpdater)
						.onChange(async (value) => {
							this.plugin.settings.enableNavColorUpdater = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(container)
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
		}
	}

	private renderAutoSyncSettings(container: HTMLElement, isVisible: boolean): void {
		container.empty();
		
		if (isVisible) {
			new Setting(container)
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

			new Setting(container)
				.setName("Startup sync delay (minutes)")
				.setDesc(
					"Minutes to wait after Obsidian starts before performing the initial sync (0 for immediate)"
				)
				.addSlider((slider) =>
					slider
						.setLimits(0, 60, 1)
						.setValue(this.plugin.settings.syncStartupDelay)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.syncStartupDelay = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(container)
				.setName("Auto-sync frequency (minutes)")
				.setDesc(
					"How often to automatically sync repositories (0 to disable periodic sync)"
				)
				.addSlider((slider) =>
					slider
						.setLimits(0, 240, 5)
						.setValue(this.plugin.settings.autoSyncFrequency)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.autoSyncFrequency = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(container)
				.setName("Sync retry attempts")
				.setDesc(
					"Number of times to retry a failed sync before giving up (0 to disable retries)"
				)
				.addSlider((slider) =>
					slider
						.setLimits(0, 10, 1)
						.setValue(this.plugin.settings.syncRetryCount)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.syncRetryCount = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(container)
				.setName("Sync retry delay (minutes)")
				.setDesc(
					"Minutes to wait before retrying a failed sync"
				)
				.addSlider((slider) =>
					slider
						.setLimits(1, 30, 1)
						.setValue(this.plugin.settings.syncRetryDelay)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.syncRetryDelay = value;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}
