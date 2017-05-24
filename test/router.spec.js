import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';

import { LoadingRouterContext } from '~/router';
import * as session from '~/session';
import { store } from '~/store';


describe('router/LoadingRouterContext', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should call check login state and preload methods on componentWillMount', async () => {
    const checkLoginStub = sandbox.stub(session, 'checkLogin');

    const rc = mount(
      <LoadingRouterContext
        dispatch={sandbox.stub().returns(Promise.resolve())}
        match={sandbox.spy()}
        router={{}}
        routes={[]}
        location={{ pathname: '/' }}
        history={{}}
        params={{}}
      />
    );

    checkLoginStub.reset();
    const match = sandbox.spy();
    const _this = rc.instance();
    await _this.componentWillMount.call({
      ..._this,
      match,
      runPreload: _this.runPreload,
      setState: _this.setState,
    });
    expect(match.callCount).to.equal(1);
    expect(checkLoginStub.callCount).to.equal(1);
  });

  it('should call preload during componentWillReceiveProps', async () => {
    const match = sandbox.spy();
    // Prevent redirect to login
    sandbox.stub(session, 'checkLogin');

    const props = {
      match,
      router: {},
      routes: [],
      location: { pathname: 'a path' },
      history: {},
      params: {},
      dispatch: store.dispatch,
    };

    const rc = shallow(
      <LoadingRouterContext
        {...props}
      />
    );

    await rc.instance().componentWillMount();

    match.reset();
    rc.instance().componentWillReceiveProps(props);
    expect(match.callCount).to.equal(1);
  });

  it('renders AppLoader on initial load', async () => {
    // Prevent redirect to login
    sandbox.stub(session, 'checkLogin');

    const rc = shallow(
      <LoadingRouterContext
        match={() => {}}
        router={{}}
        routes={[]}
        location={{ pathname: '/' }}
        history={{}}
        params={{}}
        dispatch={store.dispatch}
      />
    );

    await rc.instance().componentWillMount();

    expect(rc.find('.AppLoader').length).to.equal(1);
  });
});
