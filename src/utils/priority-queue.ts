export class PriorityQueue<T> {
  private elements: Array<QueueElement<T>>;

  constructor() {
    this.elements = [];
  }

  async enqueue(item: T, priority: number) {
    const queueElement: QueueElement<T> = { priority, item };
    let added = false;
    for (let i = 0; i < this.elements.length; i++) {
      if (priority < this.elements[i].priority) {
        this.elements.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    if (!added) {
      this.elements.push(queueElement);
    }
  }

  dequeue(): T | null {
    return this.elements.shift()?.item || null;
  }

  peek(): T | null {
    return this.elements.length > 0 ? this.elements[0].item : null;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

type QueueElement<T> = { priority: number; item: T };
