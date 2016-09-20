import { expect } from 'chai';
import {
  UPDATE_SERVICES,
  fetchServices,
} from '~/actions/api/services';
import { expectRequest } from '@/common';
import { freshState } from '@/data';

describe('actions/api/services', () => {
  it('should fetch services', async () => {
    const fn = fetchServices();
    await expectRequest(fn, '/linode/services/?page=1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_SERVICES,
        response: { foo: 'bar' },
      }), { foo: 'bar' }, null, freshState);
  });
});
