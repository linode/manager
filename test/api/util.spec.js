import sinon from 'sinon';
import { expect } from 'chai';

import { generateDefaultStateMany } from '~/api/apiResultActionReducerGenerator.js';
import { config as linodeConfig } from '~/api/configs/linodes';
import { getObjectByLabelLazily } from '~/api/util';
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
    dispatch.returns({ linodes: [null] });
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
});
