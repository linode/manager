import { RouterContext } from 'react-router';
import store from './store';

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

      const preload_indicator = document.getElementById('preload_indicator');
      if (preload_indicator) {
        preload_indicator.className = 'preload_indicator_done';
      }
    });
  }

  constructor(props) {
    super();
    this.match = props.match;
    this.fetching = false;
    this.initialLoad = true;
    this.runPreload(props);
  }

  componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    this.fetching = true;

    const preload_indicator = document.getElementById('preload_indicator');
    if (preload_indicator) {
      preload_indicator.className = 'preload_indicator';

      // Timeout to let the default (reset) className take effect before
      // starting the running transition
      setTimeout(() => {
        preload_indicator.className = 'preload_indicator_running';
        this.runPreload(newProps);
      }, 0);

      return;
    }

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
