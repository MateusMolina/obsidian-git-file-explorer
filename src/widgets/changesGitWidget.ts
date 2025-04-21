import { App, Modal, Setting } from "obsidian";
import { GitRepository } from "../git/gitRepository";
import { GitWidget } from "./gitWidget";
import { NavColorUpdater } from "./navColorUpdater";
export type GitNode = { path: string };

export class ChangesGitWidget extends GitWidget {
	private changesBuffer = 0;
	private lastChangedPaths = new Set<string>();
	private navColorUpdater: NavColorUpdater | undefined;

	private setsEqual(a: Set<string>, b: Set<string>): boolean {
		if (a.size !== b.size) return false;
		for (const x of a) if (!b.has(x)) return false;
		return true;
	}

	constructor(
		navFolderTitleEl: HTMLElement,
		gitRepository: GitRepository,
		private app: App,
		private promptCommitMsg = false,
		enableNavColorUpdater = true,
		private navColorStyle: "colored-text" | "margin-highlight" = "colored-text"
	) {
		super(navFolderTitleEl, gitRepository, "changes-git-widget");
		this.updateCallbacks.push(this.updateChanges.bind(this));

		if (enableNavColorUpdater)
			this.navColorUpdater = new NavColorUpdater(navFolderTitleEl, navColorStyle);
	}

	async updateChanges() {
		const changedNodes =
			(await this.gitRepository.getChangedFiles()) as GitNode[];
		const newPaths = new Set(changedNodes.map(n => n.path));
		
		if (this.setsEqual(newPaths, this.lastChangedPaths)) return;
		this.lastChangedPaths = newPaths;

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

	uninstall() {
		super.uninstall();
		this.navColorUpdater?.cleanup();
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
