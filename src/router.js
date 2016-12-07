import { RouterContext, match } from 'react-router';

import { store } from './store';
import { checkLogin } from './session';

// This wraps the react-router match function so that we can await it
// and replace it easily in tests.
function matchPromise(_ref, callback) {
  return new Promise(resolve => {
    match(_ref, (...args) => {
      callback(...args, resolve);
    });
  });
}

import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';

export class LoadingRouterContext extends RouterContext {
  async runPreload(newProps) {
    // Suppress component update until after route preloads have finished
    this.fetching = true;

    await this.match({
      routes: newProps.routes,
      location: newProps.location.pathname,
    }, async (error, redirectLocation, redirectParams, done) => {
      // Call preload if present on any components rendered by the route,
      // down to the page level (Layout -> IndexPage -> EditConfigPage)
      for (let i = 0; i < redirectParams.routes.length; i++) {
        const component = redirectParams.routes[i].component;
        if (component !== undefined && component.hasOwnProperty('preload')) {
          await component.preload(store, newProps.params);
        }
      }

      // Allow component update now that preloads are done
      this.fetching = false;

      // Set anything at all to force an update
      if (!this.initialLoad) {
        this.setState({
          updateNow: 'please',
        });
      }

      setTimeout(() => store.dispatch(preloadStop()), 0);
      done();
    });
  }

  constructor(props) {
    super();
    this.match = props.match;
    this.fetching = false;
    this.initialLoad = true;
  }

  async componentWillMount() {
    checkLogin(this.props);
    // Necessary to await this for testing
    await this.runPreload(this.props);
  }

  async componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    this.fetching = true;

    store.dispatch(preloadReset());
    setTimeout(() => store.dispatch(preloadStart()), 0);

    this.runPreload(newProps);
  }

  shouldComponentUpdate() {
    return !this.fetching;
  }

  render() {
    if (this.initialLoad) {
      this.initialLoad = false;

      if (this.fetching) {
        return null;
      }
    }

    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
