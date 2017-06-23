import React from 'react';
import { RouterContext, match } from 'react-router';

import {
  preloadReset,
  preloadStart,
  preloadStop,
} from '~/actions/preloadIndicator';
import Header from '~/components/Header';
import { store } from '~/store';

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

          let error = false;
          try {
            await component.preload(store, newProps.params);
          } catch (e) {
            error = true;
            window.handleError(e);
            this.setState({ noRender: true });
          }

          this.preloadCounter--;

          // If a preload triggered an error, stop preloading and all the error to be shown.
          if (error) {
            break;
          }

          newPreloads.push(component.preload);
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

    // initialLoad doesn't apply to /oauth/callback page, which is a pseudo-page only
    // loaded on login or token refresh. AppLoader should be shown while this page is
    // working and only not shown when the page after it is done loading.
    if (newProps.location.pathname !== '/oauth/callback') {
      // Wait 1 second after loading so app loader isn't jumpy.
      setTimeout(() => this.setState({ initialLoad: false }), 1000);
    }
  }

  constructor(props) {
    super(props);
    this.match = props.match;
    this.preloadCounter = 0;
    this.lastPreloads = [];

    this.state = { initialLoad: true, checkLoginDone: false };
  }

  async componentWillMount() {
    const ret = checkLogin(this.props);
    if (ret) {
      return;
    }

    // We are not going to redirect, so session is fine so far. Show AppLoader.
    this.setState({ checkLoginDone: true });

    // Necessary to await this for testing
    return this.runPreload(this.props);
  }

  async componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    this.props.dispatch(preloadReset());
    setTimeout(() => this.props.dispatch(preloadStart()), 0);

    // Necessary to await this for testing
    return this.runPreload(newProps);

    // Force scroll to the top of the page on page change. ONLY AFTER PRELOAD
    window.scroll(0, 0);
  }

  shouldComponentUpdate() {
    return this.preloadCounter === 0;
  }

  render() {
    const { pathname } = this.props.location;

    if (this.state.initialLoad &&
        pathname !== '/logout' &&
        !pathname.endsWith('/weblish')) {
      // If the user is about to be redirected somewhere, don't show them the loading screen.
      if (!this.state.checkLoginDone) {
        return null;
      }

      return (
        <div className="layout layout--appLoader full-height">
          <Header />
          <div className="AppLoader">
            <div className="AppLoader-text">Loading the Manager...</div>
            <div className="AppLoader-loader"></div>
          </div>
          {this.props.location.pathname === '/oauth/callback' ? super.render() : null}
        </div>
      );
    }

    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
