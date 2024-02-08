import { throttle } from "../src/throttle";
import { PlatformRateLimiter } from "../src/platform-rate-limiter";
import { JobScheduler } from "../src/job-scheduler";
import { NOTION_CONNECTION, GOOGLE_DRIVE_CONNECTION, SLACK_CONNECTION } from "../src/constants";
import { platformRateLimiters, jobScheduler } from "../src/throttle";

jest.useRealTimers();

test("Throttle function should return the result of the function it wraps", async () => {
  const connection = {
    platform: "testPlatform",
    connection: "testConnection1",
    niceness: 0,
    rateLimit: { requestCount: 2, windowSeconds: 10 },
  };

  const mockFunction = jest.fn().mockResolvedValue("Test Result");

  const promise = throttle(connection, mockFunction, null);

  await expect(promise).resolves.toEqual("Test Result");
  expect(mockFunction).toHaveBeenCalledTimes(1);
});

test("Throttle function should work on the sample connections", async () => {
  const mockFunction = jest.fn().mockResolvedValue("Test Result");

  const notionPromise = throttle(NOTION_CONNECTION, mockFunction, null);
  const googleDrivePromise = throttle(GOOGLE_DRIVE_CONNECTION, mockFunction, null);
  const slackPromise = throttle(SLACK_CONNECTION, mockFunction, null);

  await Promise.all([notionPromise, googleDrivePromise, slackPromise]);

  expect(mockFunction).toHaveBeenCalledTimes(3);
});

test("Job should only be added when there is a free worker", async () => {
  jobScheduler.setPollInterval(100); // 0.1 seconds
  jobScheduler.setWorkersCount(1);
  jobScheduler.busyCount = 0;

  const connection = {
    platform: "testPlatform2",
    connection: "testConnection2",
    niceness: 6,
    rateLimit: { requestCount: 2, windowSeconds: 2 },
  };

  const mockAsyncFunction1 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
  const mockAsyncFunction2 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const promise1 = throttle(connection, mockAsyncFunction1, null);
  const promise2 = throttle(connection, mockAsyncFunction2, null);

  await Promise.all([promise1, promise2]);

  // Since loopInterval is 0.1s, and there is 1 worker, and the first job takes 1s, the loop
  // will run 9 more times before the first job is done and the second job is started.
  expect(jobScheduler.busyCount).toBe(9);
});

test("Job should only be dequeued when rate limit allows even when there are free workers", async () => {
  jobScheduler.restoreDefault(); // interval 1 second, 4 workers

  const connection = {
    platform: "testPlatform3",
    connection: "testConnection3",
    niceness: 0,
    rateLimit: { requestCount: 1, windowSeconds: 3 },
  };

  const mockAsyncFunction1 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };
  const mockAsyncFunction2 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const promise1 = throttle(connection, mockAsyncFunction1, null);
  const promise2 = throttle(connection, mockAsyncFunction2, null);

  // record time to resolve all promises
  const start = Date.now();
  await Promise.all([promise1, promise2]);
  const end = Date.now();

  // Since rate limit is 1 request per 3 seconds, and we have 2 requests, the second request
  // should be delayed until the next window.
  expect(end - start).toBeGreaterThanOrEqual(3000);
});

test("Job with lowest niceness should be processed first, even with multiple platforms", async () => {
  jobScheduler.setWorkersCount(1);

  const connection1 = {
    platform: "testPlatform4",
    connection: "testConnection4",
    niceness: 1,
    rateLimit: { requestCount: 1, windowSeconds: 3 },
  };
  const connection2 = {
    platform: "testPlatform5",
    connection: "testConnection5",
    niceness: 0,
    rateLimit: { requestCount: 1, windowSeconds: 3 },
  };

  const dummyFunction = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
  const mockAsyncFunction1 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };
  const mockAsyncFunction2 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  // We use a dummy to make sure that the pq has time to "sort" before the first item is assigned to a job
  const dummyPromise = throttle(connection1, dummyFunction, null);
  const promise1 = throttle(connection1, mockAsyncFunction1, null);
  const promise2 = throttle(connection2, mockAsyncFunction2, null);

  let end1 = Date.now();
  promise1.then(() => {
    end1 = Date.now();
  });
  let end2 = Date.now();
  promise2.then(() => {
    end2 = Date.now();
  });

  await Promise.all([promise1, promise2]);

  expect(end2).toBeLessThan(end1);
});
