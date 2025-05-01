import { eventFactory } from 'src/factories';

import { mswDB } from '../indexedDB';

import type { Event } from '@linode/api-v4';
import type { MockState } from 'src/mocks/types';

interface QueuedEvents {
  event: {
    action: Event['action'];
    entity?: Event['entity'];
    secondary_entity?: Event['secondary_entity'];
  };
  mockState: MockState;
  sequence: {
    isProgressEvent?: boolean;
    status: Event['status'];
  }[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Queues a series of events to be processed in sequence.
 *
 * The sequence is sorted by the natural order of our statuses: 'scheduled', 'started', 'finished | notification | failed'.
 * Events can be marked as progress events, which will increase their duration as well as the following event's delay.
 */
export const queueEvents = (props: QueuedEvents): Promise<void> => {
  const { event, mockState, sequence } = props;

  const initialDelay = 2500;
  const progressDelay = 10_000;
  let accumulatedDelay = 0;
  let lastEventWasProgress = false;

  const processEventSequence = async (index: number): Promise<void> => {
    if (index >= sequence.length) {
      return;
    }

    const seq = sequence[index];
    const eventDelay =
      index > 0
        ? lastEventWasProgress
          ? progressDelay + initialDelay
          : initialDelay
        : 0;

    accumulatedDelay += eventDelay;
    lastEventWasProgress = seq.isProgressEvent || false;

    await delay(accumulatedDelay);

    const sequenceEvent = eventFactory.build({
      ...event,
      created: new Date().toISOString(),
      duration: null,
      percent_complete: seq.isProgressEvent ? 0 : null,
      rate: null,
      read: false,
      seen: false,
      status: seq.status,
    });

    // Add the new event to the database (store only serializable data)
    await mswDB.add('eventQueue', sequenceEvent, mockState);

    // Handle progress events separately
    if (seq.isProgressEvent) {
      const intervalId = setInterval(async () => {
        try {
          const updatedEvent = await mswDB.get('eventQueue', sequenceEvent.id);

          if (updatedEvent) {
            updatedEvent.percent_complete! += 10;
            if (updatedEvent.percent_complete! >= 100) {
              clearInterval(intervalId);
            }

            await mswDB.update(
              'eventQueue',
              updatedEvent.id,
              updatedEvent,
              mockState
            );
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error updating event progress:', error);

          return;
        }
      }, 1000);
    }

    // Recursively process the next event in the sequence
    await processEventSequence(index + 1);
  };

  return processEventSequence(0);
};
