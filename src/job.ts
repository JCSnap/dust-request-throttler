export class Job<T, U> {
  private fn: (arg: T) => Promise<U>;
  private arg: T;
  private niceness: number;

  constructor(fn: (arg: T) => Promise<U>, arg: T, niceness: number) {
    this.fn = fn;
    this.arg = arg;
    this.niceness = niceness;
  }

  public async execute(): Promise<U> {
    const res = this.fn(this.arg);
    return res;
  }

  public getNiceness(): number {
    return this.niceness;
  }

  public getPromise(): Promise<U> {
    return this.fn(this.arg);
  }
}
