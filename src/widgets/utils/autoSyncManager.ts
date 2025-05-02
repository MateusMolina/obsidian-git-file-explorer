export class AutoSyncManager {
    private syncTimeoutId: NodeJS.Timeout | null = null;
    private syncFrequency: number = 0;
    private syncCallback: (() => Promise<void>) | null = null;
    
    constructor(
        syncFrequency: number = 0, 
        syncOnStartup: boolean = false,
        syncCallback: (() => Promise<void>) | null = null
    ) {
        this.syncFrequency = syncFrequency;
        this.syncCallback = syncCallback;
        
        if (syncOnStartup) 
            this.executeSyncCallback();

        this.scheduleNextSync();
    }

    private scheduleNextSync(): void {
        if (!this.syncCallback) return;
        
        this.executeSyncCallback().finally(() => {
            if (this.isAutoSyncActive() && this.syncFrequency > 0) {
                this.syncTimeoutId = setTimeout(
                    () => this.scheduleNextSync(), 
                    this.syncFrequency * 60 * 1000
                );
            }
        });
    }

    stopAutoSync(): void {
        if (this.syncTimeoutId == null)
            return;
         
        clearTimeout(this.syncTimeoutId);
        this.syncTimeoutId = null;
    }

    isAutoSyncActive(): boolean {
        return this.syncTimeoutId !== null;
    }

    private async executeSyncCallback(): Promise<void> {
        if (!this.syncCallback) return;
        
        try {
            await this.syncCallback();
        } catch (error) {
            console.error("Auto-sync failed:", error);
        }
    }
}