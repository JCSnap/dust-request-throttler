import { type PlatformRateLimiter } from "./platform-rate-limiter";
import { MAX_WORKERS_COUNT } from "./constants";
import { Worker } from "./worker";
import { Job } from "./job";

export class TaskScheduler<T, U> {
  private platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>;
  private numberOfWorkers: number;
  private workers: Worker<T, U>[];
  private idleWorkers: Set<Worker<T, U>>;

  constructor(
    platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>,
    numberOfWorkers: number = MAX_WORKERS_COUNT
  ) {
    this.platformRateLimiters = platformRateLimiters;
    this.numberOfWorkers = numberOfWorkers;
    this.initializeWorkers(numberOfWorkers);
    this.idleWorkers = new Set(this.workers);
  }

  private initializeWorkers(numberOfWorkers: number) {
    this.workers = new Array(numberOfWorkers);
    for (let i = 0; i < numberOfWorkers; i++) {
      this.workers[i] = new Worker(i);
    }
  }

  public pollForJobs() {
    setInterval(() => {
      this.gatherIdleWorkers();
      if (this.idleWorkers.size > 0) {
        this.assignJobsToWorkers();
      } else {
        console.log("All workers are busy");
      }
    }, 1000);
  }

  private gatherIdleWorkers() {
    for (const worker of this.workers) {
      if (worker.isIdle) {
        this.idleWorkers.add(worker); // there won't be duplicates since the same worker has the same hash
      }
    }
  }

  private assignJobsToWorkers() {
    for (const worker of this.idleWorkers) {
      const job = this.getHighestPriorityJob();
      if (job) {
        worker.work(job);
        this.idleWorkers.delete(worker);
      }
    }
  }

  private getHighestPriorityJob(): Job<T, U> | undefined {
    let highestPriorityJob: Job<T, U> | null;
    for (const platformRateLimiter of this.platformRateLimiters.values()) {
      const job = platformRateLimiter.peek();
      if (job) {
        if (!highestPriorityJob || job.getNiceness() > highestPriorityJob.getNiceness()) {
          highestPriorityJob = platformRateLimiter.getHighestPriorityJobIfAllowed();
        }
      }
    }
    return highestPriorityJob;
  }
}
