import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest, expectObjectDeepEquals } from '@/common';
import { api } from '@/data';
import { DisplayPage } from '~/linodes/linode/settings/layouts/DisplayPage';

const { linodes } = api;

describe('linodes/linode/settings/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = {
    dispatch,
    linodes,
    params: { linodeLabel: 'test-linode' },
  };

  it('renders display page', async () => {
    const page = mount(
      <DisplayPage {...props} />
    );

    expect(page.find('header h2').text()).to.equal('Display');
    expect(page.find('input[name="group"]').props().value).to.equal('Test Group');

    expect(page.find('input[name="label"]').props().value).to.equal('test-linode');
    expect(page.find('button.btn.btn-default').text()).to.equal('Save');
  });

  it('changes group and label values onChange', async () => {
    const page = await mount(<DisplayPage {...props} />);

    page.find('input').map((element) => {
      const { value, name, onChange } = element.props();
      const newValue = `${value} Changed`;
      onChange({ target: { value: newValue } });
      expect(page.state(name)).to.equal(newValue);
      expect(element.props().value).to.equal(newValue);
    });
  });

  it('makes request to save changes', async () => {
    const page = mount(<DisplayPage {...props} />);

    const linode = linodes.linodes['1234'];
    dispatch.reset();
    page.find('button').simulate('click', { preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];
    const dispatched = () => ({ authentication: { token: 'hi' } });
    await expectRequest(fn, '/linode/instances/1234', dispatched,
                        { group: linode.group, label: linode.label }, { method: 'PUT' });
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
        linodes={props.linodes}
        params={props.params}
      />
    );

    expect(dispatchStub.callCount).to.equal(1);
    await page.instance().onSubmit({ preventDefault() {} });
    expect(dispatchStub.calledTwice).to.equal(true);

    const label = page.find('.form-group').at(1);
    expect(label.find('.form-control-feedback > div').text()).to.equal(error);
  });

  it('redirects if the label changed', async () => {
    const page = mount(<DisplayPage {...props} />);

    page.find('.LinodesLinodeSettingsDisplay-label').simulate('change',
      { target: { value: 'newlabel' } });

    dispatch.reset();

    await page.find('button').simulate('click', { preventDefault() {} });

    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.secondCall.args[0];
    expectObjectDeepEquals(fn, push('/linodes/newlabel/settings'));
  });
});
