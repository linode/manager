import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import {
  AuthorizedApplicationsPage,
} from '~/profile/integrations/layouts/AuthorizedApplicationsPage';
import { api } from '@/data';

const { tokens } = api;

describe('profile/integrations/layouts/AuthorizedApplicationsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('check client_tokens', () => {
    const page = shallow(
      <AuthorizedApplicationsPage
        dispatch={dispatch}
        tokens={tokens}
      />
    );

    expect(page.instance().state.clients[0].type).to.equal('client_token');
  });
});
