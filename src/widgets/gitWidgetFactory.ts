import { App } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { ChangesGitWidget } from "./changesGitWidget";
import { SyncGitWidget } from "./syncGitWidget";
import { Widget } from "./widget";
import { GitFileExplorerPluginSettings } from "src/settings";

export class GitWidgetFactory {
	constructor(
		private app: App,
		private settings: GitFileExplorerPluginSettings
	) {}

	async buildWidgets(
		parent: HTMLElement,
		repoAbsPath: string
	): Promise<Widget[]> {
		try {
			const gitRepository = await GitRepository.getInstance(repoAbsPath);

			const widgets = [];

			if (this.settings.gitSyncWidgetActive)
				widgets.push(this.createSyncGitWidget(parent, gitRepository));

			if (this.settings.gitChangesWidgetActive)
				widgets.push(
					this.createChangesGitWidget(parent, gitRepository)
				);

			return widgets;
		} catch (err) {
			return [];
		}
	}

	private createChangesGitWidget(
		parent: HTMLElement,
		repo: GitRepository
	): ChangesGitWidget {
		return new ChangesGitWidget(
			parent,
			repo,
			this.app,
			this.settings.promptCommitMsg,
			this.settings.enableNavColorUpdater,
			this.settings.navColorStyle
		);
	}

	private createSyncGitWidget(
		parent: HTMLElement,
		repo: GitRepository
	): SyncGitWidget {
		return new SyncGitWidget(
			parent, 
			repo, 
			this.settings.autoSyncFrequency,
			this.settings.autoSyncOnStartup
		);
	}
}
