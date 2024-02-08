import { type RateLimit } from "./types/rate-limit";
import { PriorityQueue } from "./utils/priority-queue";
import { Job } from "./job";

export class PlatformRateLimiter<T, U> {
  private platform: string;
  private rateLimit: RateLimit;
  private priorityQueue: PriorityQueue<Job<T, U>>;
  private requestCountThisWindow: number = 0;
  private windowStartTimestamp: number = Date.now();

  constructor(platform: string, rateLimit: RateLimit) {
    this.platform = platform;
    this.rateLimit = rateLimit;
    this.priorityQueue = new PriorityQueue();
  }

  public enqueue(job: Job<T, U>): void {
    this.priorityQueue.enqueue(job, job.getNiceness());
  }

  private dequeue(): Job<T, U> {
    return this.priorityQueue.dequeue();
  }

  public peek(): Job<T, U> | undefined {
    return this.priorityQueue.peek();
  }

  public getHighestPriorityJobIfAllowed(): Job<T, U> | null {
    if (this.priorityQueue.isEmpty()) {
      return;
    }

    const currentTime = Date.now();
    const previousWindowHasElapsed = currentTime - this.windowStartTimestamp >= this.rateLimit.windowSeconds * 1000;
    if (previousWindowHasElapsed) {
      this.resetCountAndWindow();
    }
    const addingJobWillNotExceedRateLimit = this.requestCountThisWindow + 1 <= this.rateLimit.requestCount;
    if (addingJobWillNotExceedRateLimit) {
      const job = this.dequeue();
      this.requestCountThisWindow++;
      console.log(`Rate limit not exceeded for platform ${this.platform}`);
      return job;
    } else {
      const delay = this.windowStartTimestamp + this.rateLimit.windowSeconds * 1000 - currentTime;
      console.log(`Rate limit exceeded for platform ${this.platform}. Waiting for ${delay}ms`);
      setTimeout(() => this.getHighestPriorityJobIfAllowed(), delay);
    }
  }

  private resetCountAndWindow() {
    this.requestCountThisWindow = 0;
    this.windowStartTimestamp = Date.now();
  }
}
