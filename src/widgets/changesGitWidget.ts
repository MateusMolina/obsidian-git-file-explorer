import { App, Modal, Setting } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
import { NavColorUpdater } from "./NavColorUpdater";
export type GitNode = { path: string };

export class ChangesGitWidget extends GitWidget {
	private changesBuffer = 0;
	private navColorUpdater: NavColorUpdater | undefined;

	constructor(
		navFolderTitleEl: HTMLElement,
		gitRepository: GitRepository,
		private app: App,
		private promptCommitMsg = false
	) {
		super(navFolderTitleEl, gitRepository, "changes-git-widget");
		this.updateCallbacks.push(this.updateChanges.bind(this));
		this.navColorUpdater = new NavColorUpdater(navFolderTitleEl);
	}

	async updateChanges() {
		const changedNodes =
			(await this.gitRepository.getChangedFiles()) as GitNode[];

		this.navColorUpdater?.update(changedNodes);

		if (changedNodes.length > 0) {
			this.changesBuffer = changedNodes.length;
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
		if (!this.promptCommitMsg) {
			await this.backupChanges();
			return;
		}

		new CommitMsgModal(
			this.app,
			async (commitMsg) => await this.backupChanges(commitMsg)
		).open();
	}

	private backupChanges = async (commitMsg = "") =>
		this.executeWithSuccessAnimation(async () => {
			this.widgetEl.removeClass("git-widget-changes");
			await this.gitRepository.backup(commitMsg);
		}).finally(this.update);

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
