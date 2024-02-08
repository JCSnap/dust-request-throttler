import { PriorityQueue } from "../src/utils/priority-queue";
import { Job } from "../src/job";

test("Priority Queue should serve highest to lowest priority even when higher priority items are inserted later", async () => {
  const priorityQueue = new PriorityQueue();
  await priorityQueue.enqueue(job2, job2.getNiceness()); // niceness 2
  await priorityQueue.enqueue(job3, job3.getNiceness()); // niceness 3
  await priorityQueue.enqueue(job1, job1.getNiceness()); // niceness 1

  expect(await priorityQueue.dequeue()).toBe(job1);
  expect(await priorityQueue.dequeue()).toBe(job2);
  expect(await priorityQueue.dequeue()).toBe(job3);
});

test("Priority Queue should serve tasks in the order they were enqueued if they have the same niceness", async () => {
  const priorityQueue = new PriorityQueue();
  priorityQueue.enqueue(jobA, 1);
  priorityQueue.enqueue(jobB, 1);

  expect(priorityQueue.dequeue()).toBe(jobA);
  expect(priorityQueue.dequeue()).toBe(jobB);
});

test("Priority Queue should be empty after all tasks are dequeued", async () => {
  const priorityQueue = new PriorityQueue();
  priorityQueue.enqueue(job1, 1);
  priorityQueue.enqueue(job2, 2);

  priorityQueue.dequeue();
  priorityQueue.dequeue();

  expect(priorityQueue.isEmpty()).toBe(true);
});

test("Priority Queue should be empty when no tasks are enqueued", async () => {
  const priorityQueue = new PriorityQueue();

  expect(priorityQueue.isEmpty()).toBe(true);
});

test("Peek should return the highest priority task without dequeuing it", async () => {
  const priorityQueue = new PriorityQueue();
  priorityQueue.enqueue(job1, 1);
  priorityQueue.enqueue(job2, 2);

  expect(priorityQueue.peek()).toBe(job1);
  expect(priorityQueue.peek()).toBe(job1);
});

test("Dequeue and peek should return null when the queue is empty", async () => {
  const priorityQueue = new PriorityQueue();

  expect(priorityQueue.dequeue()).toBe(null);
  expect(priorityQueue.peek()).toBe(null);
});

const job1 = new Job(
  async (x) => {
    console.log(x);
  },
  "1",
  1
);
const job2 = new Job(
  async (x) => {
    console.log(x);
  },
  "2",
  2
);
const job3 = new Job(
  async (x) => {
    console.log(x);
  },
  "3",
  3
);

const jobA = new Job(
  async (x) => {
    console.log(x);
  },
  "A",
  1
);

const jobB = new Job(
  async (x) => {
    console.log(x);
  },
  "B",
  1
);
