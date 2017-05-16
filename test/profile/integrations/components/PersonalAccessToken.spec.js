import { expect } from 'chai';
import { mount } from 'enzyme';
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';

import { hideModal } from '~/actions/modal';
import { OAUTH_SCOPES, OAUTH_SUBSCOPES } from '~/constants';
import PersonalAccessToken
  from '~/profile/integrations/components/PersonalAccessToken';

import { expectObjectDeepEquals, expectRequest } from '@/common';
import { tokens } from '@/data/tokens';


describe('profile/integrations/components/PersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();
  const clients = Object.values(tokens).filter(
    token => token.type === 'personal_access_token');

  it('renders a token', () => {
    const page = mount(
      <PersonalAccessToken
        dispatch={dispatch}
        label={clients[0].label}
        scopes={clients[0].scopes}
        expires={clients[0].expires}
        secret={clients[0].token}
      />
    );

    const rows = page.find('tr');
    expect(rows.length).to.equal(OAUTH_SCOPES.length + 1);

    for (let i = 1; i < rows.length; i++) {
      const row = rows.at(i);
      const columns = row.find('td');

      // +1 for scope name
      expect(columns.length).to.equal(OAUTH_SUBSCOPES.length + 1);
      expect(columns.at(0).text()).to.equal(_.capitalize(OAUTH_SCOPES[i - 1]));

      // No strikethroughs because all scopes are granted
      expect(row.find('s').length).to.equal(0);
      // All bold because all scopes are granted
      expect(row.find('strong').length).to.equal(OAUTH_SUBSCOPES.length);
    }
  });

  it('deletes a token', async () => {
    const page = mount(
      <PersonalAccessToken
        dispatch={dispatch}
        label={clients[0].label}
        id={clients[0].id}
        scopes={clients[0].scopes}
        expires={clients[0].expires}
        secret={clients[0].token}
      />
    );

    page.find('Dropdown').props().elements[1].action();

    expect(dispatch.callCount).to.equal(1);
    const { body } = dispatch.firstCall.args[0];

    dispatch.reset();
    body.props.onOk();

    expect(dispatch.callCount).to.equal(2);
    await expectRequest(dispatch.firstCall.args[0], `/account/tokens/${clients[0].id}`, {
      method: 'DELETE',
    });

    expectObjectDeepEquals(dispatch.secondCall.args[0], hideModal());
  });
});
