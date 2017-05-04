import { RouterContext, match } from 'react-router';

import { checkLogin } from './session';
import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';
import { kernels, types, regions, distributions } from '~/api';
import { account } from '~/api';
import { store } from '~/store';


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
      if (this.preloadCounter === 0 && !this.state.initialLoad) {
        this.setState({
          updateNow: 'please',
        });
      }

      setTimeout(() => this.props.dispatch(preloadStop()), 0);
      done();
    });
  }

  constructor(props) {
    super(props);
    this.match = props.match;
    this.preloadCounter = 0;

    this.state = { initialLoad: true };
  }

  async componentWillMount() {
    const ret = checkLogin(this.props);
    if (ret) {
      return;
    }

    const { location: { pathname }, params } = this.props;
    // No need to fetch these in weblish.
    if (!(pathname.endsWith('/weblish') && params.linodeLabel)) {
      await Promise.all([
        this.props.dispatch(account.one()),
        this.props.dispatch(kernels.all()),
        this.props.dispatch(types.all()),
        this.props.dispatch(regions.all()),
        this.props.dispatch(distributions.all()),
      ]);
    }

    // Necessary to await this for testing
    await this.runPreload(this.props);

    this.setState({ initialLoad: false });
  }

  async componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    this.props.dispatch(preloadReset());
    setTimeout(() => this.props.dispatch(preloadStart()), 0);

    await this.runPreload(newProps);
  }

  shouldComponentUpdate() {
    return this.preloadCounter === 0;
  }

  render() {
    if (this.state.initialLoad) {
      return null;
    }

    // Force scroll to the top of the page on page change.
    window.scroll(0, 0);
    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
