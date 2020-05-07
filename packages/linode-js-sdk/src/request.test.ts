import adapter from 'axios-mock-adapter';

import request, {
  baseRequest,
  // setData,
  // setHeaders,
  // setMethod,
  // setParams,
  setURL
  // setXFilter
} from './request';

const TEST_URL = 'https://www.example.com';

const mock = new adapter(baseRequest);
mock.onAny().reply(200, { data: {} });

describe('Base request and helper methods', () => {
  describe('setURL', () => {
    it('should set the specified URL', async () => {
      await request(setURL(TEST_URL));
      expect(mock.history.get[0].url).toMatch(TEST_URL);
    });
  });
});
