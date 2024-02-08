import { type PlatformRateLimiter } from "./platform-rate-limiter";
import { MAX_WORKERS_COUNT, DEFAULT_POLL_INTERVAL } from "./constants";
import { Worker } from "./worker";
import { Job } from "./job";

export class JobScheduler<T, U> {
  private platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>;
  private workers: Worker<T, U>[];
  private pollInterval: number;
  private idleWorkers: Set<Worker<T, U>>;
  public busyCount: number = 0; // for testing purposes

  constructor(
    platformRateLimiters: Map<string, PlatformRateLimiter<T, U>>,
    numberOfWorkers: number = MAX_WORKERS_COUNT,
    pollInterval: number = DEFAULT_POLL_INTERVAL
  ) {
    this.platformRateLimiters = platformRateLimiters;
    this.pollInterval = pollInterval;
    this.initializeWorkers(numberOfWorkers);
  }

  // for testing purposes
  public setPollInterval(pollInterval: number) {
    this.pollInterval = pollInterval;
  }

  // for testing purposes
  public setWorkersCount(numberOfWorkers: number) {
    this.initializeWorkers(numberOfWorkers);
  }

  // for testing purposes
  public restoreDefault() {
    this.setPollInterval(DEFAULT_POLL_INTERVAL);
    this.setWorkersCount(MAX_WORKERS_COUNT);
  }

  private initializeWorkers(numberOfWorkers: number) {
    this.workers = new Array(numberOfWorkers);
    for (let i = 0; i < numberOfWorkers; i++) {
      this.workers[i] = new Worker(i);
    }
    this.idleWorkers = new Set(this.workers);
  }

  public pollForJobs() {
    setInterval(() => {
      this.gatherIdleWorkers();
      if (this.idleWorkers.size > 0) {
        this.assignJobsToWorkers();
      } else {
        this.busyCount++;
        console.log("All workers are busy");
      }
    }, this.pollInterval);
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
