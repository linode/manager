import Axios from 'axios';

import {
  currentPollIntervalMultiplier,
  eventRequestDeadline,
  generateInFilter,
  generatePollingFilter,
  requestEvents,
  resetEventsPolling,
  setInitialEvents
} from 'src/events';


Date.now = jest.fn(() => 1234567890);

function mockResponse(data: any[], headers: any = {}) {
  return {
    data: {
      data,
      page: 1,
      pages: 1,
      results: 100,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers,
    },
  };
}

describe('events module', () => {

  describe('setInitialEvents', () => {
    it('should set events as _initial if X-Filter is the "beginning of time". ', () => {
      const response = mockResponse(
        [
          {
            id: 123,
            action: 'linode_boot',
            created: '1970-01-01T00:00:00',
            entity: null,
            percent_complete: null,
            rate: null,
            read: false,
            seen: false,
            status: 'notification',
            time_remaining: null,
            username: 'somefella',
          },
        ],
        { 'X-Filter': JSON.stringify({ created: { '+gt': '1970-01-01T00:00:00' } }) },
      );

      const expected = mockResponse(
        [
          {
            id: 123,
            action: 'linode_boot',
            created: '1970-01-01T00:00:00',
            entity: null,
            percent_complete: null,
            rate: null,
            read: false,
            seen: false,
            status: 'notification',
            time_remaining: null,
            username: 'somefella',
            _initial: true,
          },
        ],
        { 'X-Filter': JSON.stringify({ created: { '+gt': '1970-01-01T00:00:00' } }) },
      );

      const result = setInitialEvents(response);

      expect(result).toEqual(expected);
    });

    it('should return unmodified if X-Filter is not set.', () => {
      const response = mockResponse([
        {
          id: 123,
          action: 'linode_boot',
          created: '1970-01-01T00:00:00',
          entity: null,
          percent_complete: null,
          rate: null,
          read: false,
          seen: false,
          status: 'notification',
          time_remaining: null,
          username: 'somefella',
        },
      ]);

      const expected = response;

      const result = setInitialEvents(response);

      expect(result).toEqual(expected);
    });

    it('should return unmodified if X-Filter is after "the beginning of time".', () => {
      const response = mockResponse(
        [
          {
            id: 123,
            action: 'linode_boot',
            created: '1970-01-01T00:00:00',
            entity: null,
            percent_complete: null,
            rate: null,
            read: false,
            seen: false,
            status: 'notification',
            time_remaining: null,
            username: 'somefella',
          },
        ],
        { 'X-Filter': JSON.stringify({ created: { '+gt': '1971-01-01T00:00:00' } }) },
      );

      const expected = response;

      const result = setInitialEvents(response);

      expect(result).toEqual(expected);
    });
  });

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
