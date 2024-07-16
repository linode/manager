import { eventFactory } from 'src/factories';

import type { Event } from '@linode/api-v4';
import type { MockContext } from 'src/mocks/types';

interface QueuedEvents {
  event: {
    action: Event['action'];
    entity?: Event['entity'];
    secondary_entity?: Event['secondary_entity'];
  };
  mockContext: MockContext;
  sequence: {
    isProgressEvent?: boolean;
    status: Event['status'];
  }[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Queues a series of events to be processed in sequence.
 *
 * The sequence is is sorted by the natural order of our statuses: 'scheduled', 'started', 'finished | notification | failed'.
 * Events can be marked as progress events, which will increase their duration as well as the following event's delay.
 */
export const queueEvents = (props: QueuedEvents): Promise<void> => {
  const { event, mockContext, sequence } = props;

  const initialDelay = 7500;
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

    mockContext.eventQueue.push([
      sequenceEvent,
      (e) => {
        if (e.status === 'scheduled') {
          return false;
        }

        if (seq.isProgressEvent) {
          const intervalId = setInterval(() => {
            e.percent_complete! += 10;
            if (e.percent_complete! >= 100) {
              clearInterval(intervalId);
            }
          }, 1500);

          return false;
        }

        return true;
      },
    ]);

    // Recursively process the next event in the sequence
    await processEventSequence(index + 1);
  };

  return processEventSequence(0);
};
