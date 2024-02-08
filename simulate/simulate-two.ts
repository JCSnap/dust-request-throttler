/**
 * This is a simulation with many different platforms, with many concurrent requests. Focusing on both workers and rate limits.
 */

import {
  BAD_CONNECTION,
  BAD_CONNECTION_2,
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
jobScheduler.setWorkersCount(2);

const connections = [BAD_CONNECTION, BAD_CONNECTION_2];
const functions = [collectData, collectGarbage, analyse, backup, sendNotification, sendData, processData];

function simulateUserSendingRequestsConcurrently() {
  const promises = connections.flatMap((connection) => functions.map((func) => throttle(connection, func, null)));

  return Promise.all(promises);
}

simulateUserSendingRequestsConcurrently();
