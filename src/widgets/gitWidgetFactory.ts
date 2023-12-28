import { App } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { ChangesGitWidget } from "./changesGitWidget";
import { SyncGitWidget } from "./syncGitWidget";
import { Widget } from "./widget";

export class GitWidgetFactory {
	private gitRepository: GitRepository;

	private constructor(
		private app: App,
		private parent: HTMLElement,
		gitRepository: GitRepository
	) {
		this.gitRepository = gitRepository;
	}

	static async getInstance(
		app: App,
		parent: HTMLElement,
		repoAbsPath: string
	): Promise<GitWidgetFactory> {
		const gitRepository = await GitRepository.getInstance(repoAbsPath);
		return new GitWidgetFactory(app, parent, gitRepository);
	}

	createWidgetsBundle(): Widget[] {
		return [this.createSyncGitWidget(), this.createChangesGitWidget()];
	}

	private createChangesGitWidget(): ChangesGitWidget {
		return new ChangesGitWidget(this.parent, this.gitRepository, this.app);
	}

	private createSyncGitWidget(): SyncGitWidget {
		return new SyncGitWidget(this.parent, this.gitRepository);
	}
}
