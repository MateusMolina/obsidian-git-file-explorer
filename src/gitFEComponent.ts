import { GitHandler } from "./gitHandler";

export class GitFEComponent {
	private gitFEElement: HTMLElement;

	constructor(
		private parent: HTMLElement,
		private repoPath: string,
		private gitHandler: GitHandler
	) {
		this.gitFEElement = this.createOrUpdateElement();
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
		this.gitFEElement.style.display =
			text === 0 || text === "" ? "none" : "";
		this.gitFEElement.textContent = text.toString();
	}

	public onClick() {
		this.gitHandler.stageAll(this.repoPath);
		this.gitHandler.commit(this.repoPath, "auto commit");
		this.update();
	}

	public onMouseOver() {
		this.updateText("+");
	}

	public onMouseOut() {
		this.update();
	}
}
