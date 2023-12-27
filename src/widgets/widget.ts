export interface Widget {
	update(): Promise<void>;
	install(widgetId: string): void;
	uninstall(): void;
	enableUpdate(): void;
	disableUpdate(): void;
	enableEvents(): void;
	disableEvents(): void;
	getParent(): HTMLElement;
}
