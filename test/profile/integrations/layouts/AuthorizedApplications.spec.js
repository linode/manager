import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import {
  AuthorizedApplicationsPage,
} from '~/profile/integrations/layouts/AuthorizedApplicationsPage';
import { Button } from '~/components/buttons/';
import { api } from '@/data';
import { expectObjectDeepEquals, expectRequest } from '@/common';

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
    expectObjectDeepEquals(firstToken.props(), {
      type: 'application',
      nav: (
        <Button
          onClick={() => this.revokeApp(2)}
        >Revoke</Button>
      ),
      label: applicationTokens[0].client.label,
      scopes: applicationTokens[0].scopes,
      id: applicationTokens[0].client.id,
      dispatch,
    });
  });

  it('revoke token auth', async () => {
    const page = mount(
      <AuthorizedApplicationsPage
        dispatch={dispatch}
        tokens={tokens}
      />
    );

    dispatch.reset();

    const myApp = page.find('AuthorizedApplication');
    myApp.at(0).find('Button').first()
      .simulate('click');
    await page.instance().revokeApp(2);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/tokens/2', undefined, undefined,
      options => {
        expect(options.method).to.equal('DELETE');
      }
    );
  });
});
