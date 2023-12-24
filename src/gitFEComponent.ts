import { GitHandler } from "./gitHandler";
export class GitFEComponent {
	private gitFEElement: HTMLElement;
	private eventsDisabled = false;

	constructor(
		private parent: HTMLElement,
		private repoPath: string,
		private gitHandler: GitHandler
	) {
		this.gitFEElement = this.createOrUpdateElement();
		this.addEventListeners();
	}

	async update() {
		const changedFilesCount = await this.gitHandler.getChangedFilesCount(
			this.repoPath
		);
		this.updateText(changedFilesCount);
	}

	private createOrUpdateElement(): HTMLElement {
		let element = this.parent.querySelector("#counter") as HTMLElement;
		if (!element) {
			element = document.createElement("span");
			element.classList.add("git-fe-component");
			element.id = "counter";
			this.parent.appendChild(element);
		}
		return element;
	}

	public updateText(text: string | number): void {
		if (text == 0) {
			this.gitFEElement.textContent = "git";
			this.gitFEElement.classList.remove("git-fe-component-changes");
			this.eventsDisabled = true;
			return;
		}

		this.gitFEElement.classList.add("git-fe-component-changes");
		this.gitFEElement.textContent = text.toString();
		this.eventsDisabled = false;
	}

	async onClick() {
		if (this.eventsDisabled) return;
		this.eventsDisabled = true;
		this.gitHandler.stageAll(this.repoPath);
		this.gitHandler.commit(
			this.repoPath,
			"Sync " + new Date().toLocaleString()
		);
		this.gitFEElement.className =
			"git-fe-component git-fe-component-committed";
		setTimeout(() => {
			this.gitFEElement.classList.remove("git-fe-component-committed");
		}, 3000);

		this.update();
	}

	public onMouseOver() {
		if (this.eventsDisabled) return;
		this.updateText("+");
	}

	public onMouseOut() {
		if (this.eventsDisabled) return;
		this.update();
	}

	private addEventListeners() {
		this.gitFEElement.addEventListener("click", this.onClick.bind(this));
		this.gitFEElement.addEventListener(
			"mouseover",
			this.onMouseOver.bind(this)
		);
		this.gitFEElement.addEventListener(
			"mouseout",
			this.onMouseOut.bind(this)
		);
	}
}
