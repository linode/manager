import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { expectObjectDeepEquals } from '@/common';

import { Notifications } from '~/components/notifications/Notifications';

import { api } from '@/data';

const events = api.events;

describe('components/Notifications', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('disables polling on unmount', () => {
    const page = shallow(<Notifications dispatch={dispatch} events={events} />);

    page.instance().componentWillUnmount();
    expect(page.instance()._pollingTimeoutId).to.equal(null);
  });
});
