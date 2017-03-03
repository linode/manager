import sinon from 'sinon';
import { expect } from 'chai';

import { generateDefaultStateMany } from '~/api/apiResultActionReducerGenerator.js';
import { config as linodeConfig } from '~/api/configs/linodes';
import {
  getObjectByLabelLazily,
  Error404,
  lessThanDatetimeFilter,
  lessThanNowFilter,
  createHeaderFilter,
} from '~/api/util';
import { state } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';

describe('api/util', async () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();
  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('preloads a linode when it is not already in the state', async () => {
    dispatch.returns({ linodes: [], total_results: 1 });
    await getObjectByLabelLazily('linodes', 'foo-foo-foo')(dispatch, () => state);
    expect(dispatch.callCount).to.equal(1);
    let fn = dispatch.firstCall.args[0];
    dispatch.reset();

    // Call to fetch all
    dispatch.returns({ total_pages: 1, linodes: [], total_results: 0 });
    await fn(dispatch, () => state);
    fn = dispatch.firstCall.args[0];
    dispatch.reset();

    const defaultMany = generateDefaultStateMany(linodeConfig);
    await expectRequest(fn, '/linode/instances/?page=1', undefined, {
      ...defaultMany,
      linodes: [
        ...defaultMany.linodes,
        { ...testLinode, __updatedAt: null },
      ],
    }, {
      headers: {
        'X-Filter': JSON.stringify({ label: 'foo-foo-foo' }),
      },
    });
  });

  it('throws a 404 when the resource is not found', async () => {
    dispatch.returns({ linodes: [], total_results: 0 });
    // Could not for the life of me get `expect(async () => await getOb...).to.throw(Error404)`
    // to work.
    try {
      await getObjectByLabelLazily('linodes', 'foo-foo-foo')(dispatch, () => state);
      throw Error;
    } catch (e) {
      if (!(e instanceof Error404)) {
        throw Error;
      }
    }
  });

  it('provides a header structure utility function', function () {
    const emptyHeader = createHeaderFilter({});

    expect(emptyHeader).to.exist;
    expect(emptyHeader).to.be.an('object');

    expect(emptyHeader.headers).to.exist;
    expect(emptyHeader.headers).to.be.an('object');

    expect(emptyHeader.headers['X-Filter']).to.exist;
    expect(emptyHeader.headers['X-Filter']).to.be.an('object');
  });

  it('provides createHeaderFilter which assigns an object to X-Filter', function () {
    const emptyHeader = createHeaderFilter({ example: true });

    expect(emptyHeader.headers['X-Filter']).to.exist;
    expect(emptyHeader.headers['X-Filter']).to.be.an('object');
    expect(emptyHeader.headers['X-Filter'].example).to.equal(true);
  });

  it('provides a lessThanDatetimeFilter function', function () {
    const lessThanNow = lessThanDatetimeFilter('example', (new Date()).toString());

    expect(lessThanNow).to.exist;
    expect(lessThanNow).to.be.an('object');
    expect(lessThanNow.example).to.exist;
    expect(lessThanNow.example).to.be.an('object');
    expect(lessThanNow.example['+lte']).to.exist;
    expect(typeof lessThanNow.example['+lte']).to.equal('string');
    expect(typeof (new Date(lessThanNow.example['+lte']))).to.equal('object');
  });

  it('provides a lessThanNowFilter function', function () {
    const lessThanNow = lessThanNowFilter('example');

    expect(lessThanNow).to.exist;
    expect(lessThanNow).to.be.an('object');
    expect(lessThanNow.example).to.exist;
    expect(lessThanNow.example).to.be.an('object');
    expect(lessThanNow.example['+lte']).to.exist;
    expect(typeof lessThanNow.example['+lte']).to.equal('string');
    expect(typeof (new Date(lessThanNow.example['+lte']))).to.equal('object');
  });
});
