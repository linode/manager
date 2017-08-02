import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { CloneLinode } from '~/linodes/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';
import { api, state } from '@/data';
import { testType } from '@/data/types';
import { testLinode } from '@/data/linodes';


const { linodes: { linodes }, types: { types } } = api;

describe('linodes/components/CloneLinode', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('clones a linode', async function () {
    CloneLinode.trigger(dispatch, linodes, types);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'linode', testLinode.id);
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'plan', testType.id);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      async function ([fn]) {
        const _dispatch = sandbox.stub();
        _dispatch.returns({ id: 1 });
        await fn(_dispatch, () => state);

        await expectRequest(
          _dispatch.firstCall.args[0],
          `/linode/instances/${testLinode.id}/clone`, {
            method: 'POST',
            body: {
              region: REGION_MAP.Asia[0],
              type: testType.id,
            },
          });
      },
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });
});
