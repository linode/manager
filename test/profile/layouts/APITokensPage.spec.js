import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { API_ROOT } from '~/constants';
import { APITokensPage } from '~/profile/layouts/APITokensPage';

import { changeInput, expectRequest } from '@/common.js';
import { api } from '@/data';


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
    expect(token.length).to.equal(Object.keys(tokens.tokens).length);
    const firstToken = token.at(1);
    expect(firstToken.find('td img').props().src)
      .to.equal(`${API_ROOT}/account/clients/d64b169cc95fde4e367g/thumbnail`);
    expect(firstToken.find('td').at(2).text())
      .to.equal('Test client');
    expect(firstToken.find('td').at(3).text())
      .to.equal('OAuth Client Token');
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
    const actions = page.find('MassEditControl').find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Revoke').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/tokens/1', { method: 'DELETE' });
  });
});
