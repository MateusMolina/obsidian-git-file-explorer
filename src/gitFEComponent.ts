import { GitRepository } from "./gitRepository";
export class GitFEComponent {
	private parent: HTMLElement;
	private gitRepository: GitRepository;
	private gitFEElement: HTMLElement;
	private eventsDisabled = false;
	private changesBuffer = 0;

	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		this.parent = parent;
		this.gitRepository = gitRepository;
		this.gitFEElement = this.createOrUpdateElement();
		this.addEventListeners();
	}

	async update() {
		await this.updateChanges();
	}

	async updateChanges() {
		this.changesBuffer = await this.gitRepository.getChangedFilesCount();

		if (this.changesBuffer == 0) {
			this.updateText("git");
			this.gitFEElement.classList.remove("git-fe-component-changes");
			this.eventsDisabled = true;
			return;
		}

		this.gitFEElement.classList.add("git-fe-component-changes");
		this.updateText(this.changesBuffer.toString());
		this.eventsDisabled = false;
	}

	public updateText = (text: string) =>
		(this.gitFEElement.textContent = text);

	async onClick() {
		if (this.eventsDisabled) return;
		this.eventsDisabled = true;
		await this.gitRepository.stageAll();
		await this.gitRepository.commit("Sync " + new Date().toISOString());
		this.gitFEElement.className =
			"git-fe-component git-fe-component-committed";
		setTimeout(() => {
			this.gitFEElement.classList.remove("git-fe-component-committed");
		}, 3000);

		await this.update();
	}

	public onMouseOver() {
		if (this.eventsDisabled) return;
		this.updateText("+");
	}

	public onMouseOut() {
		if (this.eventsDisabled) return;
		this.updateText(this.changesBuffer.toString());
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
