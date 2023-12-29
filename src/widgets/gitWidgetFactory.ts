import { App } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { ChangesGitWidget } from "./changesGitWidget";
import { SyncGitWidget } from "./syncGitWidget";
import { Widget } from "./widget";

export class GitWidgetFactory {
	constructor(private app: App) {}

	async buildWidgets(
		parent: HTMLElement,
		repoAbsPath: string
	): Promise<Widget[]> {
		try {
			const gitRepository = await GitRepository.getInstance(repoAbsPath);

			return [
				this.createSyncGitWidget(parent, gitRepository),
				this.createChangesGitWidget(parent, gitRepository),
			];
		} catch (err) {
			return [];
		}
	}

	private createChangesGitWidget(
		parent: HTMLElement,
		repo: GitRepository
	): ChangesGitWidget {
		return new ChangesGitWidget(parent, repo, this.app);
	}

	private createSyncGitWidget(
		parent: HTMLElement,
		repo: GitRepository
	): SyncGitWidget {
		return new SyncGitWidget(parent, repo);
	}
}
