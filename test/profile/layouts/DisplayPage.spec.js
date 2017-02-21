import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
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

    page.instance().setState({ timezone: 'GMT' });
    await page.instance().timezoneOnSubmit();
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile', undefined, undefined, {
      method: 'PUT',
      body: { timezone: 'GMT' },
    });
  });

  it('renders email', async () => {
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        profile={profile}
      />
    );

    dispatch.reset();
    const email = page.find('#email');
    expect(email.props().value).to.equal('example@domain.com');

    page.instance().setState({ email: 'example2@domain.com' });
    await page.instance().emailOnSubmit();
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile', undefined, undefined, {
      method: 'PUT',
      body: { email: 'example2@domain.com' },
    });
  });
});
