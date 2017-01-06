import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { expectRequest } from '@/common';

import { expectObjectDeepEquals } from '@/common';
import { Layout } from '~/layouts/Layout';
import * as fetch from '~/fetch';
import { api } from '@/data';
import { testEvent } from '@/data/events';
import { actions as linodeActions } from '~/api/configs/linodes';
import { hideModal } from '~/actions/modal';
import { sortNotifications } from '~/components/Notifications';
import { showNotifications } from '~/actions/notifications';

describe('layouts/Layout', () => {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  const errors = {
    json: null,
    status: null,
    statusText: null,
    details: false,
  };

  function makeLayout(_dispatch = dispatch,
                      _errors = errors,
                      events = api.events,
                      linodes = api.linodes,
                      source = { source: 'foobar.html' },
                      children = <p>Hello world!</p>) {
    return (
      <Layout
        dispatch={_dispatch}
        errors={_errors}
        source={source}
        notifications={{ open: false }}
        linodes={linodes}
        events={events}
        feedback={{ open: false }}
      >{children}</Layout>
    );
  }

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('renders its children', () => {
    const component = shallow(makeLayout());
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(true);
  });

  it('renders a sidebar', () => {
    const component = shallow(makeLayout());
    expect(component.find('Sidebar').length).to.equal(1);
  });

  it('renders a header', () => {
    const component = shallow(makeLayout());
    expect(component.find('Header').length).to.equal(1);
  });

  it('renders a footer', () => {
    const component = shallow(makeLayout());
    const sourceLink = component.find('footer a');
    expect(sourceLink.text()).to.equal('Source');
    expect(sourceLink.props().href)
      .to.equal('https://github.com/linode/manager/blob/master/foobar.html');
  });

  const errorsPopulated = {
    json: {
      errors: [
        { reason: 'You done screwed up' },
      ],
    },
    status: 400,
    statusText: 'Invalid Request',
    details: false,
  };

  it('does not render children on error', () => {
    const component = shallow(makeLayout(dispatch, errorsPopulated));
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(false);
  });

  it('renders a 404 page when appropriate', () => {
    const component = shallow(makeLayout(
      dispatch, { ...errorsPopulated, status: 404 }));
    expect(component.find('Error').length).to.equal(1);
  });

  it('fetches the blog RSS feed', async () => {
    /* eslint-disable prefer-template */
    const fetchStub = sandbox.stub(fetch, 'rawFetch').returns({
      text: () => '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">' +
          '<channel>' +
            '<item>' +
              '<title>Introducing Fedora 24</title>' +
              '<link>https://example.org</link>' +
            '</item>' +
          '</channel>' +
        '</rss>',
    });

    /* eslint-enable prefer-template */
    const layout = shallow(makeLayout());
    await layout.instance().fetchBlog();
    expect(fetchStub.calledWith('https://blog.linode.com/feed/'))
      .to.equal(true);
    expect(layout.state('title')).to.equal('Introducing Fedora 24');
    expect(layout.state('link')).to.equal('https://example.org');
  });

  it('calls attachLinodesTimeout and setSourceLink on mount', () => {
    const page = shallow(makeLayout(dispatch));

    const attachEventTimeoutStub = sandbox.stub(page.instance(), 'attachEventTimeout');
    const fetchBlogStub = sandbox.stub(page.instance(), 'fetchBlog');

    page.instance().componentDidMount();

    expect(attachEventTimeoutStub.callCount).to.equal(1);
    expect(fetchBlogStub.callCount).to.equal(1);
  });

  it('disables polling on unmount', () => {
    const page = shallow(makeLayout(dispatch));

    page.instance().componentWillUnmount();

    expect(page.instance()._pollingTimeoutId).to.equal(null);
  });

  it('deals with individual events', () => {
    sandbox.stub(window, 'setTimeout', f => f());

    const page = shallow(makeLayout(dispatch, undefined, undefined, {
      ...api.linodes,
      linodes: {
        ...api.linodes.linodes,
        1237: {
          ...api.linodes.linodes['1237'],
          __updatedAt: new Date(testEvent.updated),
        },
      },
    }));

    page.instance().eventHandler(testEvent);

    expect(dispatch.callCount).to.equal(2);

    dispatch.firstCall.args[0].resource.__updatedAt = undefined;
    expectObjectDeepEquals(dispatch.firstCall.args[0], linodeActions.one({
      ...api.linodes.linodes['1237'],
      __progress: 100,
    }, [1237]));

    dispatch.secondCall.args[0].resource.__updatedAt = undefined;
    expectObjectDeepEquals(dispatch.secondCall.args[0], linodeActions.one({
      ...api.linodes.linodes['1237'],
      status: 'running',
    }, [1237]));
  });

  it('fetches only one page when some results are read', async () => {
    sandbox.stub(window, 'setTimeout', f => f());

    const fetchPageResponse = {
      events: [
        { seen: true },
        { seen: true },
      ],
    };
    const dispatchStub = sandbox.stub({ dispatch() {} }, 'dispatch', () => fetchPageResponse);
    const page = shallow(makeLayout(dispatchStub));

    const results = await page.instance().fetchEventsPage();

    expectObjectDeepEquals(results, fetchPageResponse);
    expect(dispatchStub.callCount).to.equal(1);
  });

  it('fetches multiple pages when all results are unread', async () => {
    sandbox.stub(window, 'setTimeout', f => f());

    const fetchPageResponse = {
      events: [
        { seen: false },
        { seen: false },
      ],
    };
    let firstCall = true;
    const dispatchStub = sandbox.stub({ dispatch() {} }, 'dispatch', () => {
      if (firstCall) {
        firstCall = false;
        return fetchPageResponse;
      }

      return { events: [{ seen: true }] };
    });
    const page = shallow(makeLayout(dispatchStub));

    const results = await page.instance().fetchEventsPage();

    expect(dispatchStub.callCount).to.equal(2);
    expectObjectDeepEquals(results, {
      events: [
        { seen: false },
        { seen: false },
        { seen: true },
      ],
    });
  });

  it('marks all events as seen when the notifications is opened', async () => {
    const page = shallow(
      <Layout
        dispatch={dispatch}
        errors={errors}
        source={{ source: 'foobar.html' }}
        notifications={{ open: false }}
        linodes={api.linodes}
        feedback={{ open: false }}
        events={api.events}
      ><span /></Layout>
    );

    page.instance().hideShowNotifications({ stopPropagation() {}, preventDefault() {} });

    const sortedEvents = sortNotifications(api.events);
    expect(dispatch.callCount).to.equal(3);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/account/events/${sortedEvents[0].id}/seen`);

    expectObjectDeepEquals(dispatch.secondCall.args[0], hideModal());
    expectObjectDeepEquals(dispatch.thirdCall.args[0], showNotifications());
  });
});
