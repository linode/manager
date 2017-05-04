import sinon from 'sinon';
import { expect } from 'chai';
import * as gen from '~/api/apiResultActionReducerGenerator';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';

describe('api/apiResultActionReducerGenerator.js', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should look like a region config', () => {
    const config = gen.genConfig({
      plural: 'regions',
      endpoint: id => `/regions/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    expect(config.plural).to.equal('regions');
    expect(config.supports).to.deep.equal(['ONE', 'MANY']);
    expect(config.parent).to.equal(undefined);
  });

  it('should generate a default state', () => {
    const config = gen.genConfig({
      plural: 'regions',
      endpoint: id => `/regions/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const df = gen.generateDefaultStateFull(config);
    expect(df).to.deep.equal({
      totalPages: -1,
      totalResults: -1,
      regions: {},
      ids: [],
    });
  });

  it('should add one', () => {
    const config = gen.genConfig({
      plural: 'regions',
      endpoint: id => `/regions/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const addOne = gen.generateDefaultStateOne(config, 'ph');
    expect(addOne[0]).to.equal('p');
    expect(addOne[1]).to.equal('h');
    // TODO: Make this test more clear by replacing this string with an
    // actual object such as a linode or a disk
  });

  it('should run invalidate', () => {
    const config = gen.genConfig({
      plural: 'regions',
      endpoint: id => `/regions/${id}`,
      supports: [gen.ONE, gen.MANY],
    });
    const state = { placeholder: 'placeholder' };
    const action = { ids: [], partial: true, type: 'GEN@linodes/INVALIDATE' };
    const invalid = gen.ReducerGenerator.invalidate(config, state, action);
    expect(invalid.placeholder).to.equal('placeholder');
    expect(invalid.invalid).to.equal(true);
    // TODO: test updatedAt
  });

  it('should run one', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
    });
    const state = { linodes: { foo: 'bar' }, totalPages: 1, totalResults: 1 };
    const action = { ids: [testLinode.id], type: 'GEN@linodes/ONE' };
    const output = gen.ReducerGenerator.one(config, state, action);
    expect(output.linodes.foo).to.equal('bar');
    expect(output.totalPages).to.equal(1);
    expect(output.totalResults).to.equal(1);
  });

  it('should run subresource', () => {
    const config = gen.genConfig({
      plural: 'linodes',
      endpoint: id => `/linode/instances/${id}`,
      supports: [gen.ONE, gen.MANY, gen.PUT, gen.DELETE, gen.POST],
      subresources: {
        _disks: {
          plural: 'disks',
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
