export class Semaphore {
  private permits: number;
  private waiting: ((value: void) => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      if (resolve) {
        this.permits--;
        resolve();
      }
    }
  }

  get availablePermits(): number {
    return this.permits;
  }
}