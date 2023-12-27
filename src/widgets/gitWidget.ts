import { GitRepository } from "../git/gitRepository";
import { Widget } from "./widget";

export abstract class GitWidget implements Widget {
	protected gitFEElement: HTMLElement;
	protected eventsEnabled = false;
	protected updateEnabled = true;
	protected updateCallbacks: (() => Promise<void>)[] = [];
	private updateQueue = 0;

	constructor(
		protected parent: HTMLElement,
		protected gitRepository: GitRepository,
		public widgetId: string
	) {
		this.install(widgetId);
		this.update = this.update.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.addEventListeners();
	}

	getParent(): HTMLElement {
		return this.parent;
	}

	protected updateText = (text: string) =>
		(this.gitFEElement.textContent = text);

	async update(): Promise<void> {
		this.updateQueue++;
		if (!this.updateEnabled) return;

		this.disableUpdate();

		await Promise.all([
			...this.updateCallbacks.map((callback) => callback()),
			new Promise((resolve) => setTimeout(resolve, 3000)),
		]).finally(() => this.enableUpdate());

		if (this.updateQueue > 0) {
			this.updateQueue = 0;
			await this.update();
		}
	}

	protected abstract onClick(): Promise<void>;

	protected abstract onMouseOver(): void;

	protected abstract onMouseOut(): void;

	install(widgetId: string): void {
		let element = this.parent.querySelector(`#${widgetId}`) as HTMLElement;
		if (!element) {
			element = document.createElement("span");
			element.classList.add("git-widget");
			element.id = widgetId;
			this.parent.appendChild(element);
		}
		this.gitFEElement = element;
	}

	uninstall() {
		this.gitFEElement.remove();
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

	enableUpdate(): void {
		this.updateEnabled = true;
	}

	disableUpdate(): void {
		this.updateEnabled = false;
	}

	enableEvents(): void {
		this.eventsEnabled = true;
	}

	disableEvents(): void {
		this.eventsEnabled = false;
	}
}
