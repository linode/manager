import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { DisplayPage } from '~/profile/layouts/DisplayPage';
import { TIME_ZONES } from '~/constants';

describe('profile/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const profile = {
    profile: {
      undefined: {
        timezone: 'US/Eastern',
        email: 'example@domain.com',
      },
    },
  };

  it('renders timezones', async () => {
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        profile={profile}
      />
    );

    expect(page.find('option').length).to.equal(TIME_ZONES.length);
    expect(page.find('#timezone').props().value).to.equal('US/Eastern');
  });

  it('renders email', async () => {
    const page = shallow(
      <DisplayPage
        dispatch={dispatch}
        profile={profile}
      />
    );

    expect(page.find('#email').props().value).to.equal('example@domain.com');
  });
});
