import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { APITokensPage } from '~/profile/layouts/APITokensPage';
import { expectRequest } from '~/test.helpers.js';
import { api } from '~/data';


const { tokens, apps } = api;

describe('profile/layouts/APITokensPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  const tokensAndApps = { ...tokens.tokens, ...apps.apps };

  it('renders a list of Tokens', () => {
    const page = mount(
      <APITokensPage
        dispatch={dispatch}
        selectedMap={{}}
        tokens={tokensAndApps}
      />
    );

    const token = page.find('.TableRow');
    expect(token.length).toBe(Object.keys(tokensAndApps).length);
    const firstToken = token.at(1);
    expect(firstToken.find('td').at(1).text())
      .toBe('Test client');
    expect(firstToken.find('td').at(2).text())
      .toBe('OAuth Client Token');
  });

  it('revokes selected tokens when revoke is pressed', async () => {
    const page = mount(
      <APITokensPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        tokens={tokensAndApps}
      />
    );

    dispatch.reset();
    const actions = page.find('MassEditControl').find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Revoke').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/profile/tokens/1', { method: 'DELETE' });
  });
});
