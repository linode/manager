import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { LoadingRouterContext } from '~/router';
import * as session from '~/session';

describe('router/LoadingRouterContext', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should call check login state and preload methods on componentWillMount', async () => {
    const match = sandbox.spy();
    const checkLoginStub = sandbox.stub(session, 'checkLogin');

    const rc = shallow(
      <LoadingRouterContext
        match={match}
        router={{}}
        routes={[]}
        location={{ pathname: '/' }}
        history={{}}
        params={{}}
        dispatch={() => {}}
      />
    );

    match.reset();
    checkLoginStub.reset();
    await rc.instance().componentWillMount();
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
      dispatch() {},
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

  it('should prevent updates while preload is running', async () => {
    // Prevent redirect to login
    sandbox.stub(session, 'checkLogin');

    let resolvePreload = null;
    const preload = async (store, params) => {
      expect(params).to.deep.equal({ myParam: 2 });

      return new Promise((resolve) => {
        resolvePreload = resolve;
      });
    };

    // The second call (by react-router) is not promisified.
    let firstCall = true;
    const matchPromise = (_ref, callback) =>
      !firstCall ? null : new Promise(resolve => {
        firstCall = false;
        expect(_ref.routes).to.deep.equal([1, 2, 3]);
        expect(_ref.location).to.equal('/');

        callback(null, null, { routes: [{ component: { preload } }] }, resolve);
      });

    const rc = shallow(
      <LoadingRouterContext
        match={matchPromise}
        router={{}}
        routes={[1, 2, 3]}
        location={{ pathname: '/' }}
        history={{}}
        params={{ myParam: 2 }}
        dispatch={() => {}}
      />
    );

    await rc.instance().componentWillMount();
    expect(rc.instance().shouldComponentUpdate()).to.equal(false);

    resolvePreload();
    // Allow (at least) one step in the event loop before evaluating shouldComponentUpdate
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(rc.instance().shouldComponentUpdate()).to.equal(true);
  });

  it('should not render on initial load', async () => {
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
        dispatch={() => {}}
      />
    );

    await rc.instance().componentWillMount();

    expect(rc.instance().render()).to.equal(null);
  });
});
