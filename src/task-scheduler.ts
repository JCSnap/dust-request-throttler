import { createClient } from "redis";
import { RateLimiter } from "./rate-limiter";
import { Connection } from "./types/connection";
import { type PlatformRateLimiter } from "./platform-rate-limiter";
import { MAX_WORKERS_COUNT } from "./constants";
import { Worker } from "./worker";
import { Job } from "./job";

export class TaskScheduler<T, U> {
  private platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>;
  private workers: Worker<T, U>[] = Array(MAX_WORKERS_COUNT);
  private idleWorkers: Set<Worker<T, U>>;

  constructor(platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>) {
    this.platformRateLimiters = platformRateLimiters;
    this.initializeWorkers();
    this.idleWorkers = new Set(this.workers);
  }

  private initializeWorkers() {
    for (let i = 0; i < MAX_WORKERS_COUNT; i++) {
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
        this.idleWorkers.add(worker);
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
