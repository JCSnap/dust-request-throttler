export interface RateLimit {
  requestCount: number; // Number of requests allowed per rolling window.
  windowSeconds: number; // Time window defined in seconds.
}
