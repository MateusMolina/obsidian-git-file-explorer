export class SmartDebouncer {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor(private timeout = 1500) {}

  /**
   * Debounces function execution per key to prevent excessive updates
   * @param key A unique identifier (e.g., repository path) or "*" for global update
   * @param fn The function to execute
   */
  debounce(key: string, fn: () => Promise<void>): void {
    // Special case: "*" is a global update that should cancel all other pending updates
    if (key === "*") {
      // Clear all existing timers
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers.clear();
      
      // Set new timer just for the global update
      const timer = setTimeout(async () => {
        this.timers.delete("*");
        await fn();
      }, this.timeout);
      
      this.timers.set("*", timer);
      return;
    }
    
    // Normal case: debounce per key
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }
    
    // Set new timer
    const timer = setTimeout(async () => {
      this.timers.delete(key);
      await fn();
    }, this.timeout);
    
    this.timers.set(key, timer);
  }
  
  /**
   * Clears all pending timers
   */
  clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}