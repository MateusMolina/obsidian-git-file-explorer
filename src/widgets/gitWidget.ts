import { GitRepository } from "../git/gitRepository";

export abstract class GitWidget {
	protected parent: HTMLElement;
	protected gitRepository: GitRepository;
	protected gitFEElement: HTMLElement;
	protected eventsEnabled = false;

	constructor(
		parent: HTMLElement,
		gitRepository: GitRepository,
		widgetId: string
	) {
		this.parent = parent;
		this.gitRepository = gitRepository;
		this.gitFEElement = this.createOrUpdateElement(widgetId);
		this.update = this.update.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.addEventListeners();
	}

	public updateText = (text: string) =>
		(this.gitFEElement.textContent = text);

	abstract update(): Promise<void>;

	abstract onClick(): Promise<void>;

	abstract onMouseOver(): void;

	abstract onMouseOut(): void;

	private createOrUpdateElement(widgetId: string): HTMLElement {
		let element = this.parent.querySelector(`#${widgetId}`) as HTMLElement;
		if (!element) {
			element = document.createElement("span");
			element.classList.add("git-widget");
			element.id = widgetId;
			this.parent.appendChild(element);
		}
		return element;
	}

	protected async executeWithSuccessAnimation(
		func: () => Promise<void>
	): Promise<void> {
		this.disableEvents();
		this.gitFEElement.classList.add("git-widget-success");
		await func()
			.catch((error) => {
				console.error(error);
				this.gitFEElement.classList.add("git-widget-error");
				this.updateText("⚠");
			})
			.finally(() => {
				setTimeout(() => {
					this.gitFEElement.classList.remove("git-widget-error");
					this.gitFEElement.classList.remove("git-widget-success");
				}, 3000);
			});
	}

	protected guardFunction(fun: () => void) {
		return () => {
			if (fun && this.eventsEnabled) fun();
		};
	}

	protected addEventListeners() {
		this.gitFEElement.addEventListener(
			"click",
			this.guardFunction(this.onClick)
		);
		this.gitFEElement.addEventListener(
			"mouseover",
			this.guardFunction(this.onMouseOver)
		);
		this.gitFEElement.addEventListener(
			"mouseout",
			this.guardFunction(this.onMouseOut)
		);
	}

	enableEvents = () => {
		this.eventsEnabled = true;
	};

	disableEvents = () => {
		this.eventsEnabled = false;
	};
}
