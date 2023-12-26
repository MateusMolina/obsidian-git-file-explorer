import { GitRepository } from "./gitRepository";
import { GitWidget } from "./gitWidget";
export class GitChangesComponent extends GitWidget {
	private changesBuffer = 0;

	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		super(parent, gitRepository, "git-changes-component");
	}

	async update() {
		await this.updateChanges();
	}

	async updateChanges() {
		this.changesBuffer = await this.gitRepository.getChangedFilesCount();

		if (this.changesBuffer) {
			this.gitFEElement.classList.add("git-fe-component-changes");
			this.updateText(this.changesBuffer.toString());
			this.enableEvents();
		} else {
			this.gitFEElement.classList.remove("git-fe-component-changes");
			this.updateText("git");
			this.disableEvents();
		}
	}

	async onClick() {
		this.executeWithSuccessAnimation(async () => {
			this.gitFEElement.removeClass("git-fe-component-changes");
			await this.gitRepository.stageAll();
			await this.gitRepository.commit("Sync " + new Date().toISOString());
		}).finally(this.update.bind(this));
	}

	onMouseOver() {
		this.updateText("+");
	}

	onMouseOut() {
		this.updateText(this.changesBuffer.toString());
	}
}
