import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest, expectObjectDeepEquals } from '@/common';
import { testLinode } from '@/data/linodes';
import { DisplayPage } from '~/linodes/linode/settings/layouts/DisplayPage';

describe('linodes/linode/settings/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders display page', async () => {
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    expect(page.find({ id: 'group' }).props().value).to.equal('Test Group');
    expect(page.find({ id: 'label' }).props().value).to.equal('test-linode');
  });

  it('makes request to save changes', async () => {
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('form').simulate('submit', { preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/linode/instances/1234', {
      method: 'PUT',
      body: { group: testLinode.group, label: testLinode.label },
    });
  });

  it('shows error if label is invalid', async () => {
    const env = { dispatch() {} };
    const error = 'this is my error string';
    const dispatchStub = sandbox.stub(env, 'dispatch');
    dispatchStub.throws({
      json: () => ({
        errors: [{ field: 'label', reason: error }],
      }),
    });

    const page = await mount(
      <DisplayPage
        dispatch={dispatchStub}
        linode={testLinode}
      />
    );

    expect(dispatchStub.callCount).to.equal(1);
    await page.instance().onSubmit({ preventDefault() {} });
    expect(dispatchStub.callCount).to.equal(2);

    const label = page.find('.form-group').at(1);
    expect(label.find('.form-control-feedback')
      .children()
      .first()
      .text()).to.equal(error);
  });

  it('redirects if the label changed', async () => {
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    page.find('.LinodesLinodeSettingsDisplay-label').simulate('change',
      { target: { value: 'newlabel' } });

    dispatch.reset();

    await page.find('form').simulate('submit', { preventDefault() {} });

    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.secondCall.args[0];
    expectObjectDeepEquals(fn, push('/linodes/newlabel/settings'));
  });
});
