import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/linodes/layouts/IndexPage';
import { api } from '@/data';
import { expectRequest } from '@/common.js';


const { linodes } = api;

describe('linodes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        linodes={linodes}
      />
    );

    expect(page.find('.TableRow').length).to.equal(
      Object.keys(linodes.linodes).length);
  });

  it('deletes selected linodes when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1234: true }}
        linodes={linodes}
      />);

    dispatch.reset();
    const { elements } = page.find('Dropdown').first().props();
    elements.find(d => d && d.name === 'Delete').action();
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('.btn-default').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234', { method: 'DELETE' });
  });
});
