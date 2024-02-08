# Dust Request Throttler

This repository contains the implementation of a request throttling system to optimize requests rate based on the rate-limits we have on each platform for each user which is capable of scheduling requests based on their priorities.

## Setting up

Install the dependencies with `npm install`, assuming `npm` is installed.

## Simulate

To simulate real world concurrent requests, use the following command:

```
npx ts-node simulate/simulate-two.ts
```

For additional simulation, do:

```
npx ts-node simulate/simulate-one.ts
```

## Test

For testing, do:

```
npm test
```

## Documentation

Here is a short explanation of my implementation of throttle.
I mainly use an Objected Oriented approach to design the system, with a mix of functional approach for non-stateful components. Here are the descriptions of each components:

- `throttle`: A function that ensures that tasks are executed in such a way that adheres to rate limits, while also accounting for priority.
- `Job`: A task to be executed.
- `Worker`: An entity that is capable of executing tasks.
- `PlatformRateLimiter`: A class that is responsible for actions related to its platform. Each platform will have its own `PlatformRateLimiter`. It enforces the rate limit by keeping track of the request count and time window. It also manages the queue that contains jobs connected to its platform.
- `JobScheduler`: A class that orchestrates task execution across multiple platforms. It periodically polls for jobs based on priority and availability of workers and assign accordingly.

_For more detailed documentation, go to `docs/`._
