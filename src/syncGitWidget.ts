import { GitRepository } from "./gitRepository";
import { GitWidget } from "./gitWidget";
export class SyncGitWidget extends GitWidget {
	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		super(parent, gitRepository, "sync-git-widget");
	}

	async update() {
		await this.updateSyncStatus();
	}

	async updateSyncStatus() {
		try {
			const toPullCount =
				await this.gitRepository.getToPullCommitsCount();
			const toPushCount =
				await this.gitRepository.getToPushCommitsCount();
			const statusStr = "↑" + toPushCount + " ↓" + toPullCount;

			this.gitFEElement.classList.add("git-widget-sync");
			this.updateText(statusStr);
			this.enableEvents();
		} catch (error) {
			this.disableEvents();
		}
	}

	async onClick() {
		this.executeWithSuccessAnimation(
			this.gitRepository.sync.bind(this.gitRepository)
		).finally(this.update);
	}

	onMouseOver() {}

	onMouseOut() {}
}
