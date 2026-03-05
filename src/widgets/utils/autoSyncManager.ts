export class AutoSyncManager {
    private syncTimeoutId: NodeJS.Timeout | null = null;
    private retryTimeoutId: NodeJS.Timeout | null = null;
    private startupTimeoutId: NodeJS.Timeout | null = null;
    private syncFrequency: number = 0;
    private maxRetries: number = 0;
    private retryDelay: number = 1;
    private syncCallback: (() => Promise<void>) | null = null;
    
    constructor(
        syncFrequency: number = 0, 
        syncOnStartup: boolean = false,
        syncCallback: (() => Promise<void>) | null = null,
        maxRetries: number = 0,
        retryDelay: number = 1,
        startupDelay: number = 0
    ) {
        this.syncFrequency = syncFrequency;
        this.syncCallback = syncCallback;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        
        if (syncOnStartup) {
            if (startupDelay > 0) {
                this.startupTimeoutId = setTimeout(
                    () => this.executeSyncCallback(this.maxRetries),
                    startupDelay * 60 * 1000
                );
            } else {
                this.executeSyncCallback(this.maxRetries);
            }
        }

        if(syncFrequency > 0) 
            this.scheduleNextSync();
    }

    private scheduleNextSync(): void {
        if (this.retryTimeoutId !== null) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
        }

        this.syncTimeoutId = setTimeout(
            async () => {
                await this.executeSyncCallback(this.maxRetries);
                this.scheduleNextSync();
            }, 
            this.syncFrequency * 60 * 1000
        );
    }

    stopAutoSync(): void {
        if (this.startupTimeoutId !== null) {
            clearTimeout(this.startupTimeoutId);
            this.startupTimeoutId = null;
        }

        if (this.syncTimeoutId !== null) {
            clearTimeout(this.syncTimeoutId);
            this.syncTimeoutId = null;
        }

        if (this.retryTimeoutId !== null) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
        }
    }

    private async executeSyncCallback(retriesLeft: number): Promise<void> {
        if (!this.syncCallback) return;
        
        try {
            await this.syncCallback();
        } catch (error) {
            if (retriesLeft > 0) {
                console.warn(
                    `Auto-sync failed, retrying in ${this.retryDelay} minute(s)... (${retriesLeft} attempt(s) left)`
                );
                this.retryTimeoutId = setTimeout(
                    () => this.executeSyncCallback(retriesLeft - 1),
                    this.retryDelay * 60 * 1000
                );
            } else {
                console.error("Auto-sync failed:", error);
            }
        }
    }
}