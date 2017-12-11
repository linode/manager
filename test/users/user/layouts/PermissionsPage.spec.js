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

    // global
    const globalAddVolumes = page.find('#permission-global-volumes');
    expect(globalAddVolumes.props().checked).to.equal(true);

    // customer
    const customerReadOnly = page.find('#permission-customer-access-read-only');
    expect(customerReadOnly.props().checked).to.equal(true);
  });

  it('should commit changes to the API', async () => {
    const page = shallow(
      <PermissionsPage
        dispatch={dispatch}
        user={testUser2}
      />
    );

    dispatch.reset();
    page.instance().updateGlobal('add_linodes'); // make a change to a global setting
    await page.instance().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/users/${testUser2.username}/grants`, {
        method: 'PUT',
        body: {
          global: {
            account_access: 'read_only',
            add_domains: true,
            add_images: true,
            add_linodes: false,
            add_longview: true,
            add_nodebalancers: true,
            add_stackscripts: true,
            add_volumes: true,
            cancel_account: false,
            longview_subscription: true,
          },
          linode: [
            {
              label: 'linode1',
              id: 1111,
              permissions: 'read_write',
            },
          ],
          nodebalancer: [
            {
              label: 'nb1',
              id: 2222,
              permissions: 'read_only',
            },
          ],
          domain: [
            {
              label: 'domain1',
              id: 3333,
              permissions: 'read_write',
            },
          ],
          stackscript: [
            {
              label: 'stackscript1',
              id: 4444,
              permissions: null,
            },
          ],
          longview: [
            {
              label: 'longview1',
              id: 5555,
              permissions: 'read_only',
            },
          ],
          image: [
            {
              label: 'image1',
              id: 6666,
              permissions: 'read_only',
            },
            {
              label: 'image2',
              id: 7777,
              permissions: 'read_write',
            },
          ],
          volume: [
            {
              label: 'volume1',
              id: 8888,
              permissions: null,
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

    let valueNull = page.find('.TableRow').at(0).find('input')
      .at(0)
      .props().checked;
    let valueReadOnly = page.find('.TableRow').at(0).find('input')
      .at(1)
      .props().checked;
    let valueReadWrite = page.find('.TableRow').at(0).find('input')
      .at(2)
      .props().checked;

    expect(valueNull).to.equal(false);
    expect(valueReadOnly).to.equal(false);
    expect(valueReadWrite).to.equal(true);

    const radioReadOnly = page.find('.TableRow').at(0).find('input')
      .at(1);
    radioReadOnly.simulate('change', radioReadOnly);

    valueNull = page.find('.TableRow').at(0).find('input')
      .at(0)
      .props().checked;
    valueReadOnly = page.find('.TableRow').at(0).find('input')
      .at(1)
      .props().checked;
    valueReadWrite = page.find('.TableRow').at(0).find('input')
      .at(2)
      .props().checked;

    expect(valueNull).to.equal(false);
    expect(valueReadOnly).to.equal(true);
    expect(valueReadWrite).to.equal(false);
  });
});
