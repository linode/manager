import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { api } from '@/data';
import { PermissionsPage } from '~/users/user/layouts/PermissionsPage';

const { users } = api;
const user = { testuser2: users.users[1] };

describe('users/user/layouts/PermissionsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const params = {
    username: 'testuser2',
  };

  it('renders permissions', () => {
    const page = mount(
      <PermissionsPage
        dispatch={dispatch}
        users={user}
        params={params}
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
        users={user}
        params={params}
      />
    );

    dispatch.reset();
    page.instance().updateGlobal('add_linodes');
    await page.instance().onSubmit();
    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/account/users/${params.username}/grants`, {
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
          dnszone: [
            {
              all: true,
              access: true,
              delete: true,
              label: 'domain1',
              id: 9876,
            },
          ],
        },
      }
    );
  });

  it('should change object state', async () => {
    const page = mount(
      <PermissionsPage
        dispatch={dispatch}
        users={user}
        params={params}
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
