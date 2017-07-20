import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { IndexPage } from '~/stackscripts/layouts/IndexPage';

import { api } from '@/data';
import { expectRequest } from '@/common.js';


const { stackscripts } = api;

describe('stackscripts/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of stackscripts', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        stackscripts={stackscripts}
      />
    );

    const script = page.find('.TableRow');
    // + 1 for the group
    expect(script.length).to.equal(Object.keys(stackscripts.stackscripts).length);
    const firstScript = script.at(0);
    expect(firstScript.find('Link').props().to)
      .to.equal('/stackscripts/38');
    expect(firstScript.find('td').at(1).text())
      .to.equal('Example 2');
    expect(firstScript.find('td').at(2).text())
      .to.equal('Private');
    expect(firstScript.find('td').at(3).text())
      .to.equal('42 active / 150 total deploys');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        stackscripts={stackscripts}
      />
    );

    const scriptDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    scriptDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected stackscripts when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        stackscripts={stackscripts}
      />
    );

    dispatch.reset();

    page.find('tr button').at(0).simulate('click');
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/stackscripts/38', { method: 'DELETE' });
  });
});
