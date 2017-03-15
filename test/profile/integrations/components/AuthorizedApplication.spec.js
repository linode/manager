import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { OAUTH_SCOPES, OAUTH_SUBSCOPES } from '~/constants';
import AuthorizedApplication, {
  title,
} from '~/profile/integrations/components/AuthorizedApplication';
import { api } from '@/data';

const { tokens: { tokens } } = api;

describe('profile/integrations/components/AuthorizedApplication', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders a token', () => {
    const page = mount(
      <AuthorizedApplication
        dispatch={dispatch}
        label={tokens[2].client.label}
        scopes={tokens[2].scopes}
        id={tokens[2].client.id}
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

  it('renders a limited token', () => {
    const page = mount(
      <AuthorizedApplication
        dispatch={dispatch}
        label={tokens[3].client.label}
        scopes={tokens[3].scopes}
        id={tokens[3].client.id}
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

      switch (OAUTH_SCOPES[i]) {
        case 'linodes':
          // No strikethroughs because all scopes are granted
          expect(row.find('s').length).to.equal(0);
          // All bold because all scopes are granted
          expect(row.find('strong').length).to.equal(OAUTH_SUBSCOPES.length);
          break;
        case 'nodebalancers':
          // 1 strikethrough because delete is not granted
          expect(row.find('s').length).to.equal(1);
          // All but 1 is granted are granted
          expect(row.find('strong').length).to.equal(OAUTH_SUBSCOPES.length - 1);
          break;
        default:
          // All strikethroughs because no scopes are granted
          expect(row.find('s').length).to.equal(OAUTH_SUBSCOPES.length);
          // No bold because no scopes are granted
          expect(row.find('strong').length).to.equal(0);
      }
    }
  });
});
