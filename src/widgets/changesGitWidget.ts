import { App, Modal, Setting } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
export class ChangesGitWidget extends GitWidget {
	private changesBuffer = 0;

	constructor(
		parent: HTMLElement,
		gitRepository: GitRepository,
		private app: App
	) {
		super(parent, gitRepository, "changes-git-widget");
		this.updateCallbacks.push(this.updateChanges.bind(this));
	}

	async updateChanges() {
		const changesBuffer = await this.gitRepository.getChangedFilesCount();

		if (changesBuffer) {
			this.changesBuffer = changesBuffer;
			this.widgetEl.classList.add("git-widget-changes");
			this.updateText(this.changesBuffer.toString());
			this.enableEvents();
		} else {
			this.widgetEl.classList.remove("git-widget-changes");
			this.updateText("git");
			this.disableEvents();
		}
	}

	async onClick() {
		new CommitMsgModal(this.app, async (commitMsg) => {
			await this.executeWithSuccessAnimation(async () => {
				this.widgetEl.removeClass("git-widget-changes");
				await this.gitRepository.backup(commitMsg);
			}).finally(this.update);
		}).open();
	}

	protected onMouseOver() {
		this.updateText("+");
	}

	protected onMouseOut() {
		this.updateText(this.changesBuffer.toString());
	}
}

class CommitMsgModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		const textSetting = new Setting(contentEl)
			.setName("Commit message")
			.setDesc(
				"If empty, the commit will be in the format: 'Backup @ <iso-timestamp>'"
			)
			.addText((text) =>
				text.onChange((value) => {
					this.result = value;
				})
			);

		textSetting.settingEl.addEventListener("keydown", (event) => {
			if (event.key === "Enter") this.submit();
		});

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Commit").setCta().onClick(this.submit.bind(this))
		);
	}

	submit() {
		this.close();
		this.onSubmit(this.result);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
