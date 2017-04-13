import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import _ from 'lodash';
import PersonalAccessToken
  from '~/profile/integrations/components/PersonalAccessToken';
import { OAUTH_SCOPES, OAUTH_SUBSCOPES } from '~/constants';
import { hideModal } from '~/actions/modal';
import { api } from '@/data';
import { expectRequest, expectObjectDeepEquals } from '@/common';

const { tokens } = api;

describe('profile/integrations/components/PersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();
  const clients = Object.values(tokens.tokens).filter(
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

    body.props.onOk();

    expect(dispatch.callCount).to.equal(3);
    let fn = dispatch.secondCall.args[0];
    await expectRequest(fn, `/account/tokens/${clients[0].id}`, {
      method: 'DELETE',
    });

    fn = dispatch.thirdCall.args[0];
    expectObjectDeepEquals(dispatch.thirdCall.args[0], hideModal());
  });
});
