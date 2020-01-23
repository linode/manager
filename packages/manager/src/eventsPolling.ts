import { INTERVAL } from 'src/constants';

let interval = 1;
let deadline = Date.now();
export const resetEventsPolling = (newInterval: number = 1) => {
  deadline = Date.now() + INTERVAL * newInterval;
  interval = newInterval;
};

export const setRequestDeadline = (newDeadline: number) =>
  (deadline = newDeadline);
export const setPollingInterval = (newInterval: number) =>
  (interval = newInterval);

export const getRequestDeadline = () => deadline;
export const getPollingInterval = () => interval;
