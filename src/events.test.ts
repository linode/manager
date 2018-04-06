import Axios from 'axios';

import {
  eventRequestDeadline,
  currentPollIntervalMultiplier,
  resetEventsPolling,
  generateInFilter,
  generatePollingFilter,
  requestEvents,
} from 'src/events';

Date.now = jest.fn(() => 1234567890);

describe('events module', () => {
  describe('resetEventsPolling', () => {
    it('resets both the request deadline and poll multiplier', () => {
      resetEventsPolling();
      expect(eventRequestDeadline).toBe(1234567890 + 2000);
      expect(currentPollIntervalMultiplier).toBe(1);
    });
  });

  describe('generateInFilter', () => {
    it('generates a filter from an array of values', () => {
      const res = generateInFilter('id', [12, 21, 32]);
      expect(res).toEqual(
        {
          '+or': [
            { id: 12 },
            { id: 21 },
            { id: 32 },
          ],
        },
      );
    });
  });

  describe('generatePollingFilter', () => {
    it('generates a simple filter when pollIDs is empty', () => {
      const res = generatePollingFilter('1970-01-01T00:00:00', []);
      expect(res).toEqual({ created: { '+gt': '1970-01-01T00:00:00' } });
    });
  });

  describe('requestEvents', () => {
    it('executes without error using a mock response', () => {
      Axios.get = jest.fn(() => new Promise((resolve) => {
        resolve({
          data: {
            data: [
              {
                created: '1970-01-01T22:00:00',
                percent_complete: 100,
              },
              {
                created: '1970-01-01T21:00:00',
                percent_complete: 80,
              },
            ],
          },
        });
      }));
      requestEvents();
    });
  });
});

