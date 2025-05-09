import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
import { AutoSyncManager } from "./utils/autoSyncManager";

export class SyncGitWidget extends GitWidget {
	private autoSyncManager: AutoSyncManager | null = null;

	constructor(
		parent: HTMLElement, 
		gitRepository: GitRepository, 
		autoSyncFrequency: number,
		autoSyncOnStartup: boolean
	) {
		super(parent, gitRepository, "sync-git-widget");
		this.updateCallbacks.push(this.updateSyncStatus.bind(this));
		
		if (autoSyncFrequency > 0 || autoSyncOnStartup) {
			this.autoSyncManager = new AutoSyncManager(
				autoSyncFrequency,
				autoSyncOnStartup,
				this.onClick.bind(this)
			);
			
			this.widgetEl.classList.add("auto-sync-active");
		}
	}

	public getName() { return "sync-git-widget"};

	async updateSyncStatus() {
		try {
			const toPullCount =
				await this.gitRepository.getToPullCommitsCount();
			const toPushCount =
				await this.gitRepository.getToPushCommitsCount();
			const statusStr = "↑" + toPushCount + " ↓" + toPullCount;

			this.widgetEl.classList.add("git-widget-sync");
			this.updateText(statusStr);
			this.enableEvents();
		} catch (error) {
			this.disableEvents();
		}
	}

	async onClick() {
		await this.executeWithSuccessAnimation(
			this.gitRepository.sync.bind(this.gitRepository)
		).finally(this.update);
	}

	uninstall() {
		if (this.autoSyncManager) 
			this.autoSyncManager.stopAutoSync();
		
		super.uninstall();
	}

	protected onMouseOver() {}

	protected onMouseOut() {}
}
