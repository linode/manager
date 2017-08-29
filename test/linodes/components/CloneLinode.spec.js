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
import { api } from '@/data';
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

    changeInput(modal, 'label', 'clonedLinode');
    changeInput(modal, 'linode', testLinode.id);
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'plan', testType.id);
    changeInput(modal, 'backups', true);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}/clone`, {
        method: 'POST',
        body: {
          region: REGION_MAP.Asia[0],
          type: testType.id,
          label: 'clonedLinode',
          with_backups: true,
        },
      }, { id: 1 }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });
});
