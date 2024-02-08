# Documentation

## File structure

```
src/
├── types/
├── utils/
├── throttle.ts
├── job-scheduler.ts
├── platform-rate-limiter.ts
├── job.ts
├── worker.ts
└── constants.ts
tests
simulate
docs
```

## Components in detail

[!Class Diagram](./images/class-diagram.png)

### Throttle

- Once the `throttle` function is called on a function, the function will immediately be converted into a `Job`, which will then be inserted into the priority queue of the platform managing it. For instance, if it is an activity related to "Notion", then it will be added to the queue of the Notion Rate Limiter.

### JobScheduler

- The `JobScheduler` keeps tab of all the different platforms' Rate Limiter. When the `pollForJobs()` function is called, it will create a loop of one iteration per time interval, which is completely arbitrary. For consistency sake, we set it at 0.1 second, which means that it will run 10 iterations per second.
- At one iteration, the `JobScheduler` will check if any of its workers are free. If no workers are free, it does nothing and wait for the next iteration. Else, it will attempt to assign a job to a worker.
- Since it wants to assign the highest priority job, it will iterate through all the platform Rate Limiters, and request for the highest priority job from each of them. For instance, the Notion Rate Limiter might have a job that has a niceness of 1, and the Google Drive Rate Limiter might have a job with a niceness of 0. The Google Drive job is thus of higher priority. The `PlatformRateLimiter` will only comply if they are not at their Rate Limit yet.
- After comparing and getting the highest priority job, the `JobScheduler` will then assign the job to the idling worker and executed immediately.

### PlatformRateLimiter

- Previously we mentioned how the `PlatformRateLimiter` will only comply if it is not at its Rate Limit yet. This means that it has to be able to figure out whether or not the Rate Limit has reached someone requests for a `Job`. It does so by keeping track of the number of requests thus far since the start of the window, and the time the window started. Everytime it received a request from `JobScheduler` to hand over a job, it will then check whether or not doing so will violate the Rate Limit. At the same time, it will keep the count and window timestamp up to date.

### Others

- The ones covered above make up the bulk of the throttle's logic. Here are other components that complement the system.
- `Constants`: Stores all the static, stateless variables. It provides a centralised location to easily edit the variables as need (eg. `DEFAUT_POLL_INTERVAL`). It also provides reusable constants that can be used in multiple location.
- `Job`: Can return a promise, and "delay" the execution of a task.
- `Worker`: It can accept a `Job` and execute the job. When it is not doing anything, `isIdle` is set to true, which will prompt `JobScheduler` to assign it a new `Job` to complete
- `PriorityQueue`: FIFO, simple implementation of priority queue. It might not be the most efficient one but it is the simplest and most readable one.
