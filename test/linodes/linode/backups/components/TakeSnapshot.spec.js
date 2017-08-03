import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import TakeSnapshot from '~/linodes/linode/backups/components/TakeSnapshot';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/components/TakeSnapshot', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should dispatch a snapshot request', async () => {
    TakeSnapshot.trigger(dispatch, testLinode);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'foobar');

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.label}/backups`, {
        method: 'POST',
        body: {
          label: 'foobar',
        },
      }, { id: 1 }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/linodes/${testLinode.label}/backups/1`)),
    ], 2, [{ id: 1 }]);
  });

  it('should not include label if label is not set', async () => {
    TakeSnapshot.trigger(dispatch, testLinode);
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.label}/backups`, {
        method: 'POST',
        body: {},
      }, { id: 1 }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/linodes/${testLinode.label}/backups/1`)),
    ], 2, [{ id: 1 }]);
  });
});
