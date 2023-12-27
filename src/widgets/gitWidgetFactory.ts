import { GitRepository } from "../git/gitRepository";
import { ChangesGitWidget } from "./changesGitWidget";
import { SyncGitWidget } from "./syncGitWidget";

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

	createChangesGitWidget(): ChangesGitWidget {
		return new ChangesGitWidget(this.parent, this.gitRepository);
	}

	createSyncGitWidget(): SyncGitWidget {
		return new SyncGitWidget(this.parent, this.gitRepository);
	}
}
