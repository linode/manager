import sinon from 'sinon';
import { expect } from 'chai';
import * as thunks from '~/api/genThunks';
import * as gen from '~/api/gen';
import { testLinode } from '@/data/linodes';

describe('api/genThunks', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('gets the state of a specific resource', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      singular: 'linode',
      localStorageCacheable: true,
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
    });
    const state = { api: { linodes: { foo: 'bar' } }, totalPages: 1, totalResults: 1 };
    const id = { ids: [testLinode.id] };
    const specResource = thunks.getStateOfSpecificResource(config, state, id);
    expect(specResource.foo).to.equal('bar');
  });

  it('filters resources', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      singular: 'linode',
      localStorageCacheable: true,
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
    });
    const resources = { linodes: { foo: 'bar' }, totalPages: 1, totalResults: 1 };
    const filteredResources = thunks.filterResources(config, resources);
    expect(filteredResources.linodes.foo).to.equal('bar');
  });
});
