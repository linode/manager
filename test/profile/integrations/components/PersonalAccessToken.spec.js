import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import PersonalAccessToken
  from '~/profile/integrations/components/PersonalAccessToken';
import {
  title,
} from '~/profile/integrations/components/AuthorizedApplication';
import { api } from '@/data';
import { OAUTH_SCOPES, OAUTH_SUBSCOPES } from '~/constants';

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
      />
    );

    const rows = page.find('tr');
    expect(rows.length).to.equal(OAUTH_SCOPES.length);

    for (let i = 0; i < rows.length; i++) {
      const row = rows.at(i);
      const columns = row.find('td');

      // +1 for scope name
      expect(columns.length).to.equal(OAUTH_SUBSCOPES.length + 1);
      expect(columns.at(0).text()).to.equal(title(OAUTH_SCOPES[i]));

      // No strikethroughs because all scopes are granted
      expect(row.find('s').length).to.equal(0);
      // All bold because all scopes are granted
      expect(row.find('strong').length).to.equal(OAUTH_SUBSCOPES.length);
    }
  });
});
