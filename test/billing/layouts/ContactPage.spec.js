import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ContactPage } from '~/billing/layouts/ContactPage.js';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '@/common';
import { account } from '@/data/account';


describe('billing/layouts/ContactPage', () => {
  const sandbox = sinon.sandbox.create();
  let page = undefined;

  afterEach(() => {
    sandbox.restore();
    page.unmount();
  });

  it('updates contact info', async () => {
    const dispatch = sandbox.stub();
    page = mount(
      <ContactPage
        dispatch={dispatch}
        account={account}
      />
    );

    changeInput(page, 'email', 'new@gmail.com');
    changeInput(page, 'company', 'The Company LLC');
    changeInput(page, 'lastName', 'Doe');
    changeInput(page, 'firstName', 'Jon');
    changeInput(page, 'city', 'My City');
    changeInput(page, 'state', 'NY');
    changeInput(page, 'zip', '12345');
    changeInput(page, 'country', 'GB');
    changeInput(page, 'address1', '432 West St.');
    changeInput(page, 'address2', 'Floor 2');
    changeInput(page, 'phone', '987-555-4321');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(2);
    await expectDispatchOrStoreErrors(dispatch.secondCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/settings', {
        method: 'PUT',
        body: {
          email: 'new@gmail.com',
          address_1: '432 West St.',
          address_2: 'Floor 2',
          city: 'My City',
          company: 'The Company LLC',
          country: 'GB',
          first_name: 'Jon',
          last_name: 'Doe',
          phone: '987-555-4321',
          state: 'NY',
          zip: '12345',
        },
      }),
    ]);
  });
});
