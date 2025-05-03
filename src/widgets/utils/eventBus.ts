// Simple pub/sub system for git repository updates
export class GitEventBus {
  private static instance: GitEventBus;
  private listeners: Map<string, Array<(repoPath: string) => void>> = new Map();

  private constructor() {}

  public static getInstance(): GitEventBus {
    if (!GitEventBus.instance) {
      GitEventBus.instance = new GitEventBus();
    }
    return GitEventBus.instance;
  }

  /**
   * Subscribe to updates for a specific repository or all repositories
   * @param repoPath Repository path or "*" for all repositories
   * @param callback Callback function that receives the repository path
   * @returns Unsubscribe function
   */
  public subscribe(repoPath: string, callback: (repoPath: string) => void): void {
    if (!this.listeners.has(repoPath)) {
      this.listeners.set(repoPath, []);
    }
    
    this.listeners.get(repoPath)!.push(callback);
  }

  /**
   * Notify all listeners for a repository that it needs updating
   * @param repoPath Repository path that was updated
   */
  public notifyUpdate(repoPath: string): void {
    // Notify specific repository listeners
    const callbacks = this.listeners.get(repoPath);
    if (callbacks) {
      callbacks.forEach(callback => callback(repoPath));
    }
    
    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get("*");
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => callback(repoPath));
    }
  }

  /**
   * Remove all listeners for a specific key or all listeners if no key is provided
   * @param key Optional - specific repository path to clear listeners for
   */
  public clearListeners(key?: string): void {
    if (key) {
      this.listeners.delete(key);
    } else {
      this.listeners.clear();
    }
  }
}