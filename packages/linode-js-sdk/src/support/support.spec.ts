import { AxiosRequestConfig } from 'axios';
import * as support from './support';

import { API_ROOT } from '../constants';

const mockFn = jest.fn((config: AxiosRequestConfig) =>
  Promise.resolve({ data: config })
);

interface Pagination {
  page: number;
  pageSize: number;
}

const pagination: Pagination = { page: 1, pageSize: 25 };

jest.mock('axios', () => ({
  default: (config: AxiosRequestConfig) => mockFn(config)
}));

describe('Support tickets and replies', () => {
  describe('getTickets method', () => {
    xit('should make a get request', async () => {
      await support.getTickets();
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets`
      });
      mockFn.mockClear();
    });

    xit('should accept pagination', async () => {
      await support.getTickets(pagination);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets`,
        params: {
          page: 1,
          pageSize: 25
        }
      });
      mockFn.mockClear();
    });
  });
});
