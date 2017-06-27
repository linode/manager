import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { PermissionsPage } from '~/users/user/layouts/PermissionsPage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testUser2 } from '@/data/users';


describe('users/user/layouts/PermissionsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders permissions', () => {
    const page = mount(
      <PermissionsPage
        dispatch={dispatch}
        user={testUser2}
      />
    );

    const customerAccess = page.find('#permission-customer-access');
    expect(customerAccess.props().checked).to.equal(true);
    const customerCancel = page.find('#permission-customer-cancel');
    expect(customerCancel.props().checked).to.equal(false);
    const globalLinodes = page.find('#permission-global-linodes');
    expect(globalLinodes.props().checked).to.equal(true);
    const globalNB = page.find('#permission-global-nodebalancers');
    expect(globalNB.props().checked).to.equal(true);
    const globalDNS = page.find('#permission-global-domains');
    expect(globalDNS.props().checked).to.equal(true);
  });

  it('should commit changes to the API', async () => {
    const page = shallow(
      <PermissionsPage
        dispatch={dispatch}
        user={testUser2}
      />
    );

    dispatch.reset();
    page.instance().updateGlobal('add_linodes');
    await page.instance().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/users/${testUser2.username}/grants`, {
        method: 'PUT',
        body: {
          customer: {
            access: true,
            cancel: false,
          },
          global: {
            add_linodes: false,
            add_nodebalancers: true,
            add_domains: true,
          },
          linode: [
            {
              all: true,
              access: true,
              delete: true,
              resize: true,
              label: 'linode1',
              id: 1234,
            },
          ],
          nodebalancer: [
            {
              all: true,
              access: true,
              delete: true,
              label: 'nb1',
              id: 4321,
            },
          ],
          domain: [
            {
              all: true,
              access: true,
              delete: true,
              label: 'domain1',
              id: 9876,
            },
          ],
        },
      }),
    ]);
  });

  it('should change object state', async () => {
    const page = mount(
      <PermissionsPage
        dispatch={dispatch}
        user={testUser2}
      />
    );

    const record = page.instance().state.linode[0];
    const valueWas = page.find('.TableRow').at(0).find('input')
      .at(0)
      .props().checked;
    const keys = {
      parentKey: 'linode',
      dataKey: 'all',
    };
    await page.instance().onCellChange(record, !valueWas, keys);
    const checkbox = page.find('.TableRow').at(0).find('input')
      .at(0);
    expect(checkbox.props().checked).to.equal(!valueWas);
  });
});
