import { expect } from 'chai';
import {
  UPDATE_DATACENTERS,
  fetchDatacenters,
} from '~/actions/api/datacenters';
import { expectRequest } from '@/common';
import { freshState } from '@/data';

describe('actions/api/datacenters', async () => {
  const mockResponse = {
    datacenters: [
      { id: 'datacenter_1' },
      { id: 'datacenter_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch datacenters', async () => {
    const fn = fetchDatacenters();
    await expectRequest(fn, '/datacenters?page=1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_DATACENTERS,
        response: mockResponse,
      }), mockResponse, null, freshState);
  });
});
