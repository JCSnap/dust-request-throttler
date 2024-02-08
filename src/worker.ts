import { Job } from "./job";

export class Worker<T, U> {
  private id: number;
  public isIdle: boolean = true;

  constructor(id: number) {
    this.id = id;
  }

  async work(job: Job<T, U>): Promise<void> {
    this.isIdle = false;
    try {
      await job.execute();
    } finally {
      this.isIdle = true;
    }
  }

  public getId(): number {
    return this.id;
  }
}
