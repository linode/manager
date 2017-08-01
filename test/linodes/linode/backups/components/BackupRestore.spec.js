import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import BackupRestore from '~/linodes/linode/backups/components/BackupRestore';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/components/BackupRestore', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should dispatch a restore request', async () => {
    const backup = testLinode._backups.snapshot.current;
    const page = mount(
      <BackupRestore
        dispatch={dispatch}
        linode={testLinode}
        linodes={api.linodes}
        backup={backup}
      />
    );

    const overwriteVal = page.find('input[name="overwrite"]').props().value;
    const restoreToVal = page.find('input[name="target"]').props().value;

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/1234/backups/${backup.id}/restore`, {
        method: 'POST',
        body: {
          linode: +restoreToVal,
          overwrite: overwriteVal,
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/test-linode')),
    ], 2);
  });
});
