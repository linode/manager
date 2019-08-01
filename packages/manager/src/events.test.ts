import Axios, { AxiosResponse } from 'axios';
import {
  eventRequestDeadline,
  INTERVAL,
  pollIteration,
  requestEvents,
  resetEventsPolling
} from 'src/events';

Date.now = jest.fn(() => 1234567890);

describe('events module', () => {
  describe('resetEventsPolling', () => {
    it('resets both the request deadline and poll multiplier', () => {
      resetEventsPolling();
      expect(eventRequestDeadline).toBe(1234567890 + INTERVAL);
      expect(pollIteration).toBe(1);
    });
  });

  describe('requestEvents', () => {
    it('executes without error using a mock response', () => {
      Axios.get = jest.fn(
        () =>
          new Promise(resolve => {
            resolve({
              data: {
                data: [
                  {
                    created: '1970-01-01T22:00:00',
                    percent_complete: 100
                  },
                  {
                    created: '1970-01-01T21:00:00',
                    percent_complete: 80
                  }
                ]
              }
            } as AxiosResponse);
          })
      );
      requestEvents();
    });
  });
});
