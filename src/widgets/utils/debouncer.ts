export class Debouncer {
	public queueSize = 0;
	private timerId?: NodeJS.Timeout;

	constructor(private timeout = 3000) {
		this.debounceAndRunWhenIdle = this.debounceAndRunWhenIdle.bind(this);
	}

	async debounceAndRunWhenIdle(fun: () => Promise<void>): Promise<void> {
		if (this.timerId) clearTimeout(this.timerId);

		this.timerId = setTimeout(async () => {
			this.timerId = undefined;
			await fun();
		}, this.timeout);
	}
}
