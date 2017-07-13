import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { APITokensPage } from '~/profile/layouts/APITokensPage';

import { api } from '@/data';
import { expectRequest } from '@/common.js';


const { tokens } = api;

describe('profile/layouts/APITokensPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of Tokens', () => {
    const page = mount(
      <APITokensPage
        dispatch={dispatch}
        selectedMap={{}}
        tokens={tokens}
      />
    );

    const token = page.find('.TableRow');
    // + 1 for the group
    expect(token.length).to.equal(Object.keys(tokens.tokens).length);
    const firstToken = token.at(0);
    expect(firstToken.find('td').at(1).text())
      .to.equal('personal');
    expect(firstToken.find('td').at(2).text())
      .to.equal('Personal Access Token');
  });

  it('revokes selected tokens when revoke is pressed', async () => {
    const page = mount(
      <APITokensPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        tokens={tokens}
      />
    );

    dispatch.reset();

    const actions = page.find('Dropdown').at(0).props().groups[0].elements;
    actions.find(a => a && a.name === 'Revoke').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/tokens/1', { method: 'DELETE' });
  });
});
