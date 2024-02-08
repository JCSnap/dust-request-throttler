export class Job<T, U> {
  private fn: (arg: T) => Promise<U>;
  private arg: T;
  private niceness: number;
  private resolve: ((value: U | PromiseLike<U>) => void) | null = null;
  private reject: ((reason?: any) => void) | null = null;

  constructor(fn: (arg: T) => Promise<U>, arg: T, niceness: number) {
    this.fn = fn;
    this.arg = arg;
    this.niceness = niceness;
  }

  public async execute(): Promise<void> {
    console.log("Executing job with niceness", this.niceness);
    try {
      const result = await this.fn(this.arg);
      if (this.resolve) {
        this.resolve(result);
      }
    } catch (error) {
      if (this.reject) this.reject(error);
    }
  }

  public getNiceness(): number {
    return this.niceness;
  }

  public getPromise(): Promise<U> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
