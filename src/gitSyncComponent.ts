import { GitRepository } from "./gitRepository";
import { GitWidget } from "./gitWidget";
export class GitSyncComponent extends GitWidget {
	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		super(parent, gitRepository, "git-sync-component");
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

			this.gitFEElement.classList.add("git-fe-component-syncstatus");
			this.updateText(statusStr);
			this.enableEvents();
		} catch (error) {
			this.disableEvents();
		}
	}

	async onClick() {
		this.executeWithSuccessAnimation(
			this.gitRepository.sync.bind(this.gitRepository)
		).finally(this.update.bind(this));
	}

	onMouseOver = () => {};

	onMouseOut = () => {};
}
