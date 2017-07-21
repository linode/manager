import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { DEFAULT_DISTRIBUTION } from '~/constants';
import { IndexPage } from '~/linodes/stackscripts/layouts/IndexPage';

import { api } from '@/data';
import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common.js';


const { stackscripts } = api;

describe('linodes/stackscripts/layouts/IndexPage', () => {
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

  it('creates a stackscript', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        stackscripts={stackscripts}
      />
    );

    dispatch.reset();

    page.find('button').at(0).simulate('click');
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();

    changeInput(modal, 'label', 'WordPress');

    modal.find('Form').props().onSubmit({ preventDefault() {} });

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/stackscripts/', {
        method: 'POST',
        body: {
          label: 'WordPress',
          script: '#!/bin/bash\n\n# Your script goes here.',
          distributions: [DEFAULT_DISTRIBUTION],
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/stackscripts/1')),
    ], 2, [{ id: 1 }]);
  });
});
