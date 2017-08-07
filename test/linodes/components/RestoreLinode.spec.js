import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { RestoreLinode } from '~/linodes/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';
import { api } from '@/data';
import { testType } from '@/data/types';


const { linodes: { linodes }, types: { types } } = api;

describe('linodes/components/RestoreLinode', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('creates a new linode from a backup', async function () {
    RestoreLinode.trigger(dispatch, linodes, types);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'backup', '1234');
    changeInput(modal, 'label', 'Restored from backup');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'plan', testType.id);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          backup: '1234',
          label: 'Restored from backup',
          region: REGION_MAP.Asia[0],
          type: testType.id,
          backups_enabled: false,
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });

  it('creates a new linode from a backup with backups enabled', async function () {
    RestoreLinode.trigger(dispatch, linodes, types);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'backup', '1235');
    changeInput(modal, 'label', 'Restored from backup');
    changeInput(modal, 'region', REGION_MAP.Asia[1]);
    changeInput(modal, 'plan', testType.id);
    changeInput(modal, 'backups', true);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          backup: '1235',
          label: 'Restored from backup',
          region: REGION_MAP.Asia[1],
          type: testType.id,
          backups_enabled: true,
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });
});
