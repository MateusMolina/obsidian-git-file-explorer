import { GitRepository } from "../git/gitRepository";
import { ChangesGitWidget } from "./changesGitWidget";
import { SyncGitWidget } from "./syncGitWidget";
import { Widget } from "./widget";

export class GitWidgetFactory {
	private gitRepository: GitRepository;

	private constructor(
		private parent: HTMLElement,
		gitRepository: GitRepository
	) {
		this.gitRepository = gitRepository;
	}

	static async getInstance(
		parent: HTMLElement,
		repoAbsPath: string
	): Promise<GitWidgetFactory> {
		const gitRepository = await GitRepository.getInstance(repoAbsPath);
		return new GitWidgetFactory(parent, gitRepository);
	}

	createWidgetsBundle(): Widget[] {
		return [this.createSyncGitWidget(), this.createChangesGitWidget()];
	}

	private createChangesGitWidget(): ChangesGitWidget {
		return new ChangesGitWidget(this.parent, this.gitRepository);
	}

	private createSyncGitWidget(): SyncGitWidget {
		return new SyncGitWidget(this.parent, this.gitRepository);
	}
}
