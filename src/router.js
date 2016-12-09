import { RouterContext } from 'react-router';
import store from './store';

import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';

export class LoadingRouterContext extends RouterContext {
  async runPreload(newProps) {
    // Suppress component update until after route preloads have finished
    this.fetching = true;

    this.match({
      routes: newProps.routes,
      location: newProps.location.pathname,
    }, async (error, redirectLocation, redirectParams) => {
      // Call preload (if present) on any components rendered by the route,
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
    });
  }

  constructor(props) {
    super();
    this.match = props.match;
    this.fetching = false;
    this.initialLoad = true;
    this.runPreload(props);
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
