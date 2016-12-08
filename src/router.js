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

      const preloadIndicator = document.getElementById('preload_indicator');
      if (preloadIndicator) {
        preloadIndicator.className =
          'PreloadIndicator PreloadIndicator--done';
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

    const preloadIndicator = document.getElementById('preload_indicator');
    if (preloadIndicator) {
      preloadIndicator.className = 'PreloadIndicator';

      // Timeout to let the default (reset) className take effect before
      // starting the running transition
      setTimeout(() => {
        preloadIndicator.className =
          'PreloadIndicator PreloadIndicator--running';
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
