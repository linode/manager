import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import {
  AuthorizedApplicationsPage,
} from '~/profile/integrations/layouts/AuthorizedApplicationsPage';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

const { tokens } = api;

describe('profile/integrations/layouts/AuthorizedApplicationsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of tokens', () => {
    const page = shallow(
      <AuthorizedApplicationsPage
        dispatch={dispatch}
        tokens={tokens}
      />
    );

    const myApplications = page.find('AuthorizedApplication');
    const applicationTokens = Object.values(tokens.tokens).filter(
      ({ type }) => type === 'client_token');
    expect(myApplications.length).to.equal(applicationTokens.length);
    const firstToken = myApplications.at(0);
    expectObjectDeepEquals(firstToken.props().client, applicationTokens[0]);
  });
});
