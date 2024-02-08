import { Job } from "./job";

export class Worker<T, U> {
  private id: number;
  public isIdle: boolean = true;

  constructor(id: number) {
    this.id = id;
  }

  async work(job: Job<T, U>): Promise<U> {
    this.isIdle = false;
    const res = await job.execute();
    this.isIdle = true;
    return res;
  }

  public getId(): number {
    return this.id;
  }
}
