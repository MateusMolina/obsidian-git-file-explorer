import { GitRepository } from "../git/gitRepository";
import { Widget } from "./widget";

export abstract class GitWidget implements Widget {
	protected widgetEl: HTMLElement;
	protected eventsEnabled = false;
	protected updateEnabled = true;
	protected updateCallbacks: (() => Promise<void>)[] = [];

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

	protected updateText = (text: string) => (this.widgetEl.textContent = text);

	async update(): Promise<void> {
		if (this.updateEnabled) await this.updateNow();
	}

	private async updateNow() {
		await Promise.all([
			...this.updateCallbacks.map((callback) => callback()),
		]);
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
		this.widgetEl = element;
	}

	uninstall() {
		this.widgetEl.remove();
	}

	protected async executeWithSuccessAnimation(
		func: () => Promise<void>
	): Promise<void> {
		this.disableEvents();
		this.widgetEl.classList.add("git-widget-success");
		await func()
			.catch((error) => {
				console.error(error);
				this.widgetEl.classList.add("git-widget-error");
				this.updateText("⚠");
			})
			.finally(() => {
				setTimeout(() => {
					this.widgetEl.classList.remove("git-widget-error");
					this.widgetEl.classList.remove("git-widget-success");
				}, 3000);
			});
	}

	protected guardFunction(fun: (event?: Event) => void) {
		return (event?: Event) => {
			if (event) event.stopPropagation();
			if (fun && this.eventsEnabled) fun(event);
		};
	}

	protected addEventListeners() {
		this.widgetEl.addEventListener(
			"click",
			this.guardFunction(this.onClick)
		);
		this.widgetEl.addEventListener(
			"mouseover",
			this.guardFunction(this.onMouseOver)
		);
		this.widgetEl.addEventListener(
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
