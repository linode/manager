import sinon from 'sinon';
import { expect } from 'chai';
import * as gen from '~/api/gen';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';

describe('api/gen', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should look like a datacenter config', () => {
    const config = gen.genConfig({
      plural: 'datacenters',
      singular: 'datacenter',
      localStorageCacheable: true,
      endpoint: id => `/datacenters/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    expect(config.plural).to.equal('datacenters');
    expect(config.singular).to.equal('datacenter');
    expect(config.localStorageCacheable).to.equal(true);
    expect(config.supports).to.deep.equal(['ONE', 'MANY']);
    expect(config.parent).to.equal(undefined);
  });

  it('should generate a default state', () => {
    const config = gen.genConfig({
      plural: 'datacenters',
      singular: 'datacenter',
      localStorageCacheable: true,
      endpoint: id => `/datacenters/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const df = gen.genDefaultState(config);
    expect(df).to.deep.equal({
      totalPages: -1,
      totalResults: -1,
      datacenters: {},
    });
  });

  it('should add meta', () => {
    const config = gen.genConfig({
      plural: 'datacenters',
      singular: 'datacenter',
      localStorageCacheable: true,
      endpoint: id => `/datacenters/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const addMeta = gen.addMeta(config, 'ph');
    expect(addMeta[0]).to.equal('p');
    expect(addMeta[1]).to.equal('h');
    expect(addMeta._polling).to.equal(false);
  });

  it('should run invalidate', () => {
    const config = gen.genConfig({
      plural: 'datacenters',
      singular: 'datacenter',
      localStorageCacheable: true,
      endpoint: id => `/datacenters/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const state = { placeholder: 'placeholder' };
    const action = { ids: [], partial: true, type: 'GEN@linodes/INVALIDATE' };
    const invalid = gen.ReducerGenerator.invalidate(config, state, action);
    expect(invalid.placeholder).to.equal('placeholder');
    expect(invalid.invalid).to.equal(true);
  });

  it('should run one', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      singular: 'linode',
      localStorageCacheable: true,
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
    });
    const state = { linodes: { foo: 'bar' }, totalPages: 1, totalResults: 1 };
    const action = { ids: [testLinode.id], type: 'GEN@linodes/ONE' };
    const output = gen.ReducerGenerator.one(config, state, action);
    expect(output.linodes[testLinode.id]._polling).to.equal(false);
    expect(output.linodes.foo).to.equal('bar');
    expect(output.totalPages).to.equal(1);
    expect(output.totalResults).to.equal(1);
  });

  it('should run subresource', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      singular: 'linode',
      localStorageCacheable: true,
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
      subresources: {
        _disks: {
          plural: 'disks',
          singular: 'disk',
          endpoint: (linode, disk) => `/linode/instances/${linode}/disks/${disk}`,
          supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
        },
      },
    });
    const state = { ...api.linodes };
    const action = {
      ids: [testLinode.id, '12345'],
      type: 'GEN@linodes.disks/ONE',
      resource: { ...api.linodes.linodes[testLinode.id]._disks.disks['12345'], foo: 'bar' },
    };
    const output = gen.ReducerGenerator.subresource(config, state, action);
    const thisDisk = output.linodes[testLinode.id]._disks.disks['12345'];
    expect(output.totalPages).to.equal(api.linodes.totalPages);
    expect(output.totalResults).to.equal(api.linodes.totalResults);
    expect(thisDisk.foo).to.equal('bar');
    expect(thisDisk.__updatedAt).to.not.equal(undefined);
  });
});
