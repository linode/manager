import { RouterContext, match } from 'react-router';

import { store } from './store';
import { checkLogin } from './session';
import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';
import { kernels, types, datacenters, distributions } from '~/api';


// This wraps the react-router match function so that we can await it
// and replace it easily in tests.
function matchPromise(_ref, callback) {
  return new Promise(resolve => {
    match(_ref, (...args) => {
      callback(...args, resolve);
    });
  });
}

export class LoadingRouterContext extends RouterContext {
  async runPreload(newProps) {
    // Suppress component update until after route preloads have finished

    await this.match({
      routes: newProps.routes,
      location: newProps.location.pathname,
    }, async (error, redirectLocation, redirectParams, done) => {
      // Call preload if present on any components rendered by the route,
      // down to the page level (Layout -> IndexPage -> EditConfigPage)
      for (let i = 0; i < redirectParams.routes.length; i++) {
        const component = redirectParams.routes[i].component;
        if (component !== undefined && component.hasOwnProperty('preload')) {
          this.preloadCounter++;
          await component.preload(store, newProps.params);
          this.preloadCounter--;
        }
      }

      // Set anything at all to force an update
      if (this.preloadCounter === 0 && !this.initialLoad) {
        this.setState({
          updateNow: 'please',
        });
      }

      setTimeout(() => store.dispatch(preloadStop()), 0);
      done();
    });
  }

  constructor(props) {
    super(props);
    this.match = props.match;
    this.preloadCounter = 0;
    this.initialLoad = true;
  }

  async componentWillMount() {
    const ret = checkLogin(this.props);
    if (ret) {
      return;
    }

    const { location: { pathname }, params } = this.props;
    // No need to fetch these in weblish.
    if (!(pathname.endsWith('/weblish') && params.linodeLabel)) {
      store.dispatch(kernels.all());
      store.dispatch(types.all());
      store.dispatch(datacenters.all());
      store.dispatch(distributions.all());
    }

    // Necessary to await this for testing
    await this.runPreload(this.props);
  }

  async componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    store.dispatch(preloadReset());
    setTimeout(() => store.dispatch(preloadStart()), 0);

    this.runPreload(newProps);
  }

  shouldComponentUpdate() {
    return !this.initialLoad && this.preloadCounter === 0;
  }

  render() {
    if (this.initialLoad) {
      this.initialLoad = false;

      if (this.preloadCounter > 0) {
        // This is a special case in React that will halt the render -- effectively reverting
        // to its previous state until we're ready to render something for real.
        return null;
      }
    }

    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
