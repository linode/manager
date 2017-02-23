import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import {
  PersonalAccessTokensPage,
} from '~/profile/integrations/layouts/PersonalAccessTokensPage';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

const { tokens } = api;

describe('profile/integrations/layouts/PersonalAccessTokensPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('check personal_access_token', () => {
    const page = shallow(
      <PersonalAccessTokensPage
        dispatch={dispatch}
        tokens={tokens}
      />
    );
    
    expect(page.instance().state.clients[0].type).to.equal('personal_access_token');
  });
});
