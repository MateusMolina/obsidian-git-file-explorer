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

        if(syncFrequency > 0) 
            this.scheduleNextSync();
    }

    private scheduleNextSync(): void {
        this.syncTimeoutId = setTimeout(
            async () => {
                await this.executeSyncCallback();
                this.scheduleNextSync();
            }, 
            this.syncFrequency * 60 * 1000
        );
    }

    stopAutoSync(): void {
        if (this.syncTimeoutId == null)
            return;
         
        clearTimeout(this.syncTimeoutId);
        this.syncTimeoutId = null;
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