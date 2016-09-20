import { expect } from 'chai';
import {
  UPDATE_DISTROS,
  fetchDistros,
} from '~/actions/api/distros';
import { expectRequest } from '@/common';
import { freshState } from '@/data';

describe('actions/api/distros', async () => {
  const mockResponse = {
    distributions: [
      { id: 'distro_1' },
      { id: 'distro_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch distros', async () => {
    const fn = fetchDistros();
    await expectRequest(fn, '/linode/distributions/?page=1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_DISTROS,
        response: mockResponse,
      }), mockResponse, null, freshState);
  });
});
