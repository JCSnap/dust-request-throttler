import { type RateLimit } from "./types/rate-limit";
import { type Connection } from "./types/connection";
import { PlatformRateLimiter } from "./platform-rate-limiter";
import { Job } from "./job";
import { JobScheduler } from "./job-scheduler";

export const platformRateLimiters = new Map<string, PlatformRateLimiter<any, any>>();
export const jobScheduler = new JobScheduler(platformRateLimiters);

export function throttle<T, U>(connection: Connection, fn: (arg: T) => Promise<U>, arg: T): Promise<U> {
  let platformRateLimiter = platformRateLimiters.get(connection.platform);
  if (!platformRateLimiter) {
    platformRateLimiter = createAndAddPlatformRateLimiter(connection.platform, connection.rateLimit);
  }
  const job = new Job(fn, arg, connection.niceness);
  platformRateLimiter.enqueue(job);
  return job.getPromise();
}

jobScheduler.pollForJobs();

function createAndAddPlatformRateLimiter(platform: string, rateLimit: RateLimit): PlatformRateLimiter<any, any> {
  const platformRateLimiter = new PlatformRateLimiter(platform, rateLimit);
  platformRateLimiters.set(platform, platformRateLimiter);
  return platformRateLimiter;
}
