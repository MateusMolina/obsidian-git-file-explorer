import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
export class ChangesGitWidget extends GitWidget {
	private changesBuffer = 0;

	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		super(parent, gitRepository, "changes-git-widget");
		this.updateCallbacks.push(this.updateChanges.bind(this));
	}

	async updateChanges() {
		const changesBuffer = await this.gitRepository.getChangedFilesCount();

		if (changesBuffer) {
			this.changesBuffer = changesBuffer;
			this.gitFEElement.classList.add("git-widget-changes");
			this.updateText(this.changesBuffer.toString());
			this.enableEvents();
		} else {
			this.gitFEElement.classList.remove("git-widget-changes");
			this.updateText("git");
			this.disableEvents();
		}
	}

	async onClick() {
		await this.executeWithSuccessAnimation(async () => {
			this.gitFEElement.removeClass("git-widget-changes");
			await this.gitRepository.backup();
		}).finally(this.update);
	}

	protected onMouseOver() {
		this.updateText("+");
	}

	protected onMouseOut() {
		this.updateText(this.changesBuffer.toString());
	}
}
