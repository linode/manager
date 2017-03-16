import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { IndexPage } from '~/settings/layouts/IndexPage';

describe('settings', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const settings = {
    network_helper: false,
  };

  it('renders network helper', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        settings={settings}
      />
    );
    const checkbox = page.find('#networkHelper').at(0);
    expect(checkbox.props().checked).to.equal(false);
  });

  it('change network helper', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        settings={settings}
      />
    );
    const networkHelper = page.find('#networkHelper').at(0);
    const valueWas = networkHelper.props().checked;
    networkHelper.simulate('change');
    expect(networkHelper.props().checked).to.equal(!valueWas);
  });

  it('submit network helper', async() => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        settings={settings}
      />
    );

    dispatch.reset();
    await page.instance().onSubmit();
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/settings', undefined, undefined, {
      method: 'PUT',
      body: { network_helper: false },
    });
  });
});
