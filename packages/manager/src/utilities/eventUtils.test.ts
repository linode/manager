import { eventFactory } from 'src/factories';
import { getEventTimestamp } from './eventUtils';
import { parseAPIDate } from './date';

const createdTimestamp = '2023-06-06T20:23:43.000Z';
const finishedTimestamp = '2023-06-06T20:24:43.000Z';
const mockScheduledEvent = eventFactory.build({
  status: 'scheduled',
  created: createdTimestamp,
});
const mockInProgressEvent = eventFactory.build({
  status: 'started',
  created: createdTimestamp,
  duration: 0,
});
const mockFinishedEvent = eventFactory.build({
  status: 'finished',
  duration: 60,
  created: createdTimestamp,
});

describe('getEventTimestamp utility function', () => {
  it('calculates the finished event timestamp from the created event timestamp by adding the duration', () => {
    expect(getEventTimestamp(mockFinishedEvent)).toEqual(
      parseAPIDate(finishedTimestamp)
    );
  });
  it('uses the created event timestamp for an in-progress event', () => {
    expect(getEventTimestamp(mockInProgressEvent)).toEqual(
      parseAPIDate(createdTimestamp)
    );
  });
  it('uses the created event timestamp for an event without a duration', () => {
    expect(getEventTimestamp(mockScheduledEvent)).toEqual(
      parseAPIDate(createdTimestamp)
    );
  });
});
