export const MAX_WORKERS_COUNT = 4;

export const DEFAULT_POLL_INTERVAL = 100; // 0.1 seconds

// https://developers.notion.com/reference/request-limits#:~:text=The%20rate%20limit%20for%20incoming,of%20three%20requests%20per%20second.
export const NOTION_RATE_LIMIT = {
  requestCount: 3,
  windowSeconds: 1,
};

// Assuming we set the rate limit per user to 1000 requests per 100 seconds
// https://stackoverflow.com/questions/10311969/what-is-the-limit-on-google-drive-api-usage
export const GOOGLE_DRIVE_RATE_LIMIT = {
  requestCount: 1000,
  windowSeconds: 100,
};

// Though Slack have different rate limits for different tiers, we will assume a single rate limit for simplicity
// https://api.slack.com/apis/rate-limits
export const SLACK_RATE_LIMIT = {
  // assuming tier 4
  requestCount: 100,
  windowSeconds: 60,
};

export const NOTION_CONNECTION = {
  platform: "notion",
  connection: "notion_connection",
  niceness: 0,
  rateLimit: NOTION_RATE_LIMIT,
};

export const GOOGLE_DRIVE_CONNECTION = {
  platform: "google_drive",
  connection: "google_drive_connection",
  niceness: 0,
  rateLimit: GOOGLE_DRIVE_RATE_LIMIT,
};

export const SLACK_CONNECTION = {
  platform: "slack",
  connection: "slack_connection",
  niceness: 0,
  rateLimit: SLACK_RATE_LIMIT,
};
