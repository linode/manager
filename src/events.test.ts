import Axios from 'axios';
import * as moment from 'moment';
import {
  eventRequestDeadline,
  INTERVAL,
  pollIteration,
  requestEvents,
  resetEventsPolling,
  shouldRequestNotifications
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
            });
          })
      );
      requestEvents();
    });
  });

  describe('shouldRequestNotifications', () => {
    const d1 = '2019-05-23T12:00:00';
    const d2 = '2019-05-23T12:00:01';

    const d1InMilliseconds = moment.utc(d1).valueOf();
    const d2InMilliseconds = moment.utc(d2).valueOf();

    it('should return `true` if there is a linode_resize event created AFTER the last time notifications were updated', () => {
      expect(
        shouldRequestNotifications(d1InMilliseconds, 'linode_resize', d2)
      ).toBe(true);
    });

    it('should return `false` if there is a linode_resize event created BEFORE the last time notifications were updated', () => {
      expect(
        shouldRequestNotifications(d2InMilliseconds, 'linode_resize', d1)
      ).toBe(false);
    });

    it("should return `false` for events that aren't related to notifications", () => {
      expect(
        shouldRequestNotifications(d1InMilliseconds, 'linode_boot', d2)
      ).toBe(false);
      expect(
        shouldRequestNotifications(d1InMilliseconds, 'linode_update', d2)
      ).toBe(false);
    });
  });
});
