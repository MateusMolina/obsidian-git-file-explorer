import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
export class ChangesGitWidget extends GitWidget {
	private changesBuffer = 0;

	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		super(parent, gitRepository, "changes-git-widget");
	}

	async update() {
		if (this.updateEnabled) await this.updateChanges();
	}

	async updateChanges() {
		const changesBuffer = await this.gitRepository.getChangedFilesCount();

		if (changesBuffer) {
			this.changesBuffer = changesBuffer;
			this.gitFEElement.classList.add("git-widget-changes");
			this.updateText(this.changesBuffer.toString());
			console.log("enabling");
			this.enableEvents();
		} else {
			this.gitFEElement.classList.remove("git-widget-changes");
			this.updateText("git");
			this.disableEvents();
		}
	}

	async onClick() {
		this.executeWithSuccessAnimation(async () => {
			this.gitFEElement.removeClass("git-widget-changes");
			await this.gitRepository.stageAll();
			await this.gitRepository.commit("Sync " + new Date().toISOString());
		}).finally(this.update);
	}

	protected onMouseOver() {
		this.updateText("+");
	}

	protected onMouseOut() {
		this.updateText(this.changesBuffer.toString());
	}
}