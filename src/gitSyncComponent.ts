import { error } from "console";
import { GitRepository } from "./gitRepository";
export class GitSyncComponent {
	private parent: HTMLElement;
	private gitRepository: GitRepository;
	private gitFEElement: HTMLElement;
	private eventsDisabled = false;

	constructor(parent: HTMLElement, gitRepository: GitRepository) {
		this.parent = parent;
		this.gitRepository = gitRepository;
		this.gitFEElement = this.createOrUpdateElement();
		this.addEventListeners();
	}

	async update() {
		await this.updateSyncStatus();
	}

	async updateSyncStatus() {
		try {
			const toPullCount =
				await this.gitRepository.getToPullCommitsCount();
			const toPushCount =
				await this.gitRepository.getToPushCommitsCount();
			const statusStr = "↑" + toPushCount + " ↓" + toPullCount;

			this.gitFEElement.classList.add("git-fe-component-syncstatus");
			this.updateText(statusStr);
			this.eventsDisabled = false;
		} catch (error) {
			this.eventsDisabled = true;
		}
	}

	public updateText = (text: string) =>
		(this.gitFEElement.textContent = text);

	async onClick() {
		if (this.eventsDisabled) return;
		this.eventsDisabled = true;

		const errorOut = () => {
			this.gitFEElement.classList.add("git-fe-component-error");
			this.updateText("error");
			setTimeout(() => {
				this.gitFEElement.classList.remove("git-fe-component-error");
			}, 3000);
		};

		this.gitFEElement.classList.add("git-fe-component-success");
		await this.gitRepository
			.sync()
			.catch(errorOut)
			.finally(() =>
				setTimeout(() => {
					this.gitFEElement.classList.remove(
						"git-fe-component-success"
					);
				}, 3000)
			);

		await this.update();
	}

	public onMouseOver() {
		if (this.eventsDisabled) return;
	}

	public onMouseOut() {
		if (this.eventsDisabled) return;
	}

	private createOrUpdateElement(): HTMLElement {
		let element = this.parent.querySelector(
			"#git-sync-component"
		) as HTMLElement;
		if (!element) {
			element = document.createElement("span");
			element.classList.add("git-fe-component");
			element.id = "git-sync-component";
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
