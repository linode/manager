import { expect } from 'chai';
import sinon from 'sinon';

import { LoadingRouterContext } from '~/router';

describe('loading router context', () => {
  it('should call preload methods during constructor', async () => {
    const match = sinon.stub().callsArgWith(1, null, null, []);

    new LoadingRouterContext({ // eslint-disable-line no-new
      match,
      routes: [],
      location: {
        pathname: 'a path',
      },
      params: 'some params',
    });

    expect(match.calledOnce).to.equal(true);
  });

  it('should call preload during componentWillReceiveProps', async () => {
    const match = sinon.stub().callsArgWith(1, null, null, []);

    const props = {
      match,
      routes: [],
      location: {
        pathname: 'a path',
      },
      params: 'some params',
    };

    const rc = new LoadingRouterContext(props);

    match.reset();
    rc.componentWillReceiveProps(props);
    expect(match.calledOnce).to.equal(true);
  });

  it('should prevent updates while preload is running', async () => {
    let resolvePreload = null;

    const preload = async (store, params) => {
      expect(params).to.equal('some params');

      return new Promise((resolve) => {
        resolvePreload = resolve;
      });
    };

    const rc = new LoadingRouterContext({
      routes: [],
      params: 'some params',
      match: sinon.stub().callsArgWith(1, null, null, {
        routes: [{ component: { preload } }],
      }),
      location: {
        pathname: 'a path',
      },
    });

    expect(rc.shouldComponentUpdate()).to.equal(false);

    resolvePreload();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(rc.shouldComponentUpdate()).to.equal(true);
  });

  it('should not render on initial load', async () => {
    const rc = new LoadingRouterContext({
      match: () => {},
      routes: [],
      params: 'some params',
      location: {
        pathname: 'a path',
      },
    });

    expect(rc.render()).to.equal(null);
  });
});
