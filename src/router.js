import React from 'react';
import { RouterContext, match } from 'react-router';

import { checkLogin } from './session';
import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';
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
      const newPreloads = [];

      // Call preload if present on any components rendered by the route,
      // down to the page level (Layout -> IndexPage -> EditConfigPage)
      for (let i = 0; i < redirectParams.routes.length; i++) {
        const { component } = redirectParams.routes[i];

        if (component !== undefined && component.hasOwnProperty('preload')) {
          // If this page's preload was loaded in the last page change, don't load it again.
          if (this.lastPreloads.indexOf(component.preload) !== -1) {
            // Store as if we had called it.
            newPreloads.push(component.preload);
            continue;
          }

          this.preloadCounter++;
          await component.preload(store, newProps.params);
          newPreloads.push(component.preload);
          this.preloadCounter--;
        }
      }

      if (newPreloads.length) {
        this.lastPreloads = newPreloads;
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
    this.lastPreloads = [];

    this.state = { initialLoad: true };
  }

  async componentWillMount() {
    const ret = checkLogin(this.props);
    if (ret) {
      return;
    }

    // Necessary to await this for testing
    await this.runPreload(this.props);

    // Wait 1 second after loading
    setTimeout(() => this.setState({ initialLoad: false }), 1000);
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
      return (
        <div className="AppLoader">
          <div className="AppLoader-text">Loading the Manager...</div>
          <div className="AppLoader-loader"></div>
        </div>
      );
    }

    // Force scroll to the top of the page on page change.
    window.scroll(0, 0);
    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
