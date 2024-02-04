import { RateLimit } from "./rate-limit";

export interface Connection {
  platform: string; // A unique platform identifier.
  connection: string; // A unique connection identifier.
  niceness: number; // Associated workflow priority, 0 is the highest priority.
  rateLimit: RateLimit; // The rate-limit for the connection.
}
