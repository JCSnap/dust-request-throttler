/**
 * This is a simulation with many different platforms, with many concurrent requests.
 * It is possible for connections with higher niceness to be processed first, due to rate limits reasons.
 */

import {
  NOTION_CONNECTION,
  NOTION_CONNECTION_GARBAGE_COLLECTOR,
  NOTTION_CONNECTION_ANALYTICS,
  NOTION_CONNECTION_BACKUP,
  GOOGLE_DRIVE_CONNECTION,
  GOOGLE_DRIVE_CONNECTION_ANALYTICS,
  GOOGLE_DRIVE_CONNECTION_BACKUP,
  SLACK_CONNECTION,
  SLACK_CONNECTION_ANALYTICS,
  collectData,
  collectGarbage,
  analyse,
  backup,
  sendNotification,
  sendData,
  processData,
} from "../src/constants";
import { throttle, jobScheduler } from "../src/throttle";

jobScheduler.restoreDefault();
jobScheduler.setWorkersCount(1);

const connections = [
  NOTION_CONNECTION,
  NOTION_CONNECTION_GARBAGE_COLLECTOR,
  NOTTION_CONNECTION_ANALYTICS,
  NOTION_CONNECTION_BACKUP,
  GOOGLE_DRIVE_CONNECTION,
  GOOGLE_DRIVE_CONNECTION_ANALYTICS,
  GOOGLE_DRIVE_CONNECTION_BACKUP,
  SLACK_CONNECTION,
  SLACK_CONNECTION_ANALYTICS,
];

const functions = [collectData, collectGarbage, analyse, backup, sendNotification, sendData, processData];

function simulateUserSendingRequestsConcurrently() {
  const promises = connections.flatMap((connection) => functions.map((func) => throttle(connection, func, null)));

  return Promise.all(promises);
}

simulateUserSendingRequestsConcurrently();
