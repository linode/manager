import { eventFactory } from 'src/factories';

import { parseAPIDate } from './date';
import { getEventTimestamp } from './eventUtils';

const createdTimestamp = '2023-06-06T20:23:43.000Z';
const finishedTimestamp = '2023-06-06T20:24:43.000Z';
const mockInProgressEvent = eventFactory.build({
  created: createdTimestamp,
  duration: 0,
  status: 'started',
});
const mockFinishedEvent1 = eventFactory.build({
  created: createdTimestamp,
  duration: 60,
  status: 'finished',
});
const mockFinishedEvent2 = eventFactory.build({
  created: createdTimestamp,
  status: 'finished',
});

describe('getEventTimestamp utility function', () => {
  it('calculates the finished event timestamp from the created event timestamp by adding the duration', () => {
    expect(getEventTimestamp(mockFinishedEvent1)).toEqual(
      parseAPIDate(finishedTimestamp)
    );
  });
  it('uses the created event timestamp for an in-progress event', () => {
    expect(getEventTimestamp(mockInProgressEvent)).toEqual(
      parseAPIDate(createdTimestamp)
    );
  });
  it('uses the created event timestamp for a finished event without a duration', () => {
    expect(getEventTimestamp(mockFinishedEvent2)).toEqual(
      parseAPIDate(createdTimestamp)
    );
  });
});
