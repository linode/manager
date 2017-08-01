import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddLinode } from '~/linodes/components';

import { changeInput, expectRequest } from '@/common';
import { testType } from '@/data/types';
import { testDistro } from '@/data/distros';
import { testPlan } from '@/data/plans';


describe('linodes/components/StatusDropdown', function () {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('creates a linode with no distribution', async function () {
    const modal = mount(AddLinode.trigger(dispatch, linodes, plans));

    changeInput(modal, 'label', 'No distro linode');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'plan', testType.id);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          label: 'No distro linode',
          region: REGION_MAP.Asia[0],
          plan: testType.id,
          enable_backups: false,
        },
      }),
    ]);
  });

  it('creates a linode with a distribution and backups', function () {
    const modal = mount(AddLinode.trigger(dispatch, linodes, plans));

    changeInput(modal, 'label', 'Ubuntu Linode');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'plan', testType.id);
    changeInput(modal, 'distribution', testDistro.id);
    changeInput(modal, 'password', 'foobar');
    changeInput(modal, 'backups', true);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          label: 'No distro linode',
          region: REGION_MAP.Asia[0],
          plan: testType.id,
          distribution: testDistro.id,
          password: 'foobar',
          enable_backups: true,
        },
      }),
    ]);
  });
});
