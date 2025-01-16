import { beforeEach, describe, vi, expect, it } from 'vitest';
import adapter from 'axios-mock-adapter';
import { object, string } from 'yup';
import request, {
  baseRequest,
  isEmpty,
  setData,
  setHeaders,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from './request';

const TEST_URL = 'https://www.example.com';

const mock = new adapter(baseRequest);
mock.onAny().reply(200, { data: {} });

beforeEach(() => {
  mock.resetHistory();
  vi.clearAllMocks();
});

describe('Linode JS SDK', () => {
  describe('Base request and helper methods', () => {
    describe('setURL', () => {
      it('should set the specified URL', async () => {
        await request(setURL(TEST_URL));
        expect(mock.history.get[0].url).toMatch(TEST_URL);
      });
    });

    describe('setMethod', () => {
      it('should create a GET request', async () => {
        await request(setMethod('GET'));
        expect(mock.history.get).toHaveLength(1);
      });

      it('should create a POST request', async () => {
        await request(setMethod('POST'));
        expect(mock.history.post).toHaveLength(1);
      });
    });

    describe('setHeaders', () => {
      it('should add a header', async () => {
        const contentType = 'application/x-www-form-urlencoded;charset=utf-8';
        await request(setHeaders({ 'Content-Type': contentType }));
        expect(mock.history.get[0].headers).toHaveProperty(
          'Content-Type',
          contentType
        );
      });
    });

    describe('setXFilter', () => {
      it('should add a header', async () => {
        const filter = { label: 'my-linode' };
        await request(setXFilter(filter));
        expect(mock.history.get[0].headers).toHaveProperty(
          'X-Filter',
          JSON.stringify(filter)
        );
      });

      it('should handle nested filters', async () => {
        const filter = {
          '+or': [{ vcpus: 1 }, { class: 'standard' }],
        };
        await request(setXFilter(filter));
        expect(mock.history.get[0].headers).toHaveProperty(
          'X-Filter',
          JSON.stringify(filter)
        );
      });
    });

    describe('setParams', () => {
      it('should set URL params', async () => {
        const params = { page: 1, page_size: 25 };
        await request(setParams(params));
        expect(mock.history.get[0].params).toEqual(params);
      });
    });

    describe('setData', () => {
      it('should set provided data as the request body', async () => {
        const data = { label: 'my-linode', type: 'standard-g6-1' };
        await request(setData(data));
        expect(mock.history.get[0].data).toEqual(JSON.stringify(data));
      });
    });

    describe('Composing constructor functions', () => {
      it('should apply method, data, params, filters, and headers to the final request', async () => {
        const headers = 'application/json';
        const params = { page: 1, page_size: 1 };
        const data = { size: 10 };
        const filter = { size: { '+gte': 6 } };
        await request(
          setURL(TEST_URL),
          setMethod('POST'),
          setHeaders({ 'Content-Type': headers }),
          setXFilter(filter),
          setParams(params),
          setData(data)
        );
        const response = mock.history.post[0];
        expect(response).toBeDefined();
        expect(response).toHaveProperty('url', TEST_URL);
        expect(response).toHaveProperty('data', JSON.stringify(data));
        expect(response.headers).toHaveProperty('Content-Type', headers);
        expect(response).toHaveProperty('params', params);
        expect(response.headers).toHaveProperty(
          'X-Filter',
          JSON.stringify(filter)
        );
      });
    });
  });

  describe('Yup client validation', () => {
    const testSchema = object({
      name: string().required('This is required!'),
    });

    const spy = vi.spyOn(testSchema, 'validateSync');

    it('should validate the schema before submitting a request', async () => {
      await request(setData({ name: 'valid-name' }, testSchema));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(mock.history.get).toHaveLength(1);
    });

    it('should return schema errors as an array of Linode API errors without submitting a request', async () => {
      await request(setData({} as any, testSchema)).catch((error) => {
        expect(error).toEqual([
          {
            field: 'name',
            reason: 'This is required!',
          },
        ]);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(mock.history.get).toHaveLength(0);
      });
    });
  });

  describe('Helpers', () => {
    describe('isEmpty', () => {
      it('returns true for undefined and null', () => {
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty(null)).toBe(true);
      });

      it('returns true for an empty array', () => {
        expect(isEmpty([])).toBe(true);
      });

      it('returns true for an empty object', () => {
        expect(isEmpty({})).toBe(true);
      });

      it('returns true for an empty string', () => {
        expect(isEmpty('')).toBe(true);
      });

      it('returns false for non-empty objects', () => {
        expect(isEmpty(1)).toBe(false);
        expect(isEmpty('five')).toBe(false);
        expect(isEmpty([undefined, undefined, undefined])).toBe(false);
        expect(isEmpty({ fruits: ['apple', 'orange'] })).toBe(false);
        expect(isEmpty(new Date())).toBe(false);
      });
    });
  });
});
