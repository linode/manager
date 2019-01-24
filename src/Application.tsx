import 'font-logos/assets/font-logos.css';
import createBrowserHistory from 'history/createBrowserHistory';
import * as React from 'react';
import { initAnalytics, initTagManager } from 'src/analytics';
import { GA_ID, GTM_ID, isProduction } from 'src/constants';
import 'src/exceptionReporting';
import { sendEvent } from 'src/utilities/analytics';
import 'src/utilities/createImageBitmap';
import 'src/utilities/request';
import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import { LocalStorageAccessError, storage, theme } from 'src/utilities/storage';
import './events';
import TheApplicationIsOnFire from './features/TheApplicationIsOnFire';
import './index.css';
import {
  initialize as sessionInitialize,
  refreshOAuthOnUserInteraction,
  refreshOAuthToken
} from './session';

interface State {
  error?: Error;
}

export class Application extends React.PureComponent<{}, State> {
  state: State = { error: undefined };

  componentWillMount() {
    try {
      storage.theme.get();

      /*
       * Initialize Analytic and Google Tag Manager
       */
      initAnalytics(GA_ID, isProduction);
      initTagManager(GTM_ID);

      /**
       * Send pageviews unless blacklisted.
       */
      createBrowserHistory().listen(({ pathname }) => {
        /** https://palantir.github.io/tslint/rules/strict-boolean-expressions/ */
        if ((window as any).ga && isPathOneOf(['/oauth'], pathname) === false) {
          (window as any).ga('send', 'pageview');
        }
      });

      /** LocalStorage */
      if (theme.get() === 'dark') {
        sendEvent({
          category: 'Theme Choice',
          action: 'Dark Theme',
          label: location.pathname
        });
      } else {
        sendEvent({
          category: 'Theme Choice',
          action: 'Light Theme',
          label: location.pathname
        });
      }

      /** Session */
      sessionInitialize();

      const isExcludedRoute = isPathOneOf(
        ['/oauth', '/null', '/login'],
        window.location.pathname
      );

      if (!isExcludedRoute) {
        refreshOAuthToken();
      }
      refreshOAuthOnUserInteraction();
    } catch (error) {
      this.setState({ error });
    }
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const { error } = this.state;
    if (error) {
      const message =
        error instanceof LocalStorageAccessError
          ? `Unable to access cookies. Please check your browser settings and try reloading.`
          : undefined;

      return <TheApplicationIsOnFire message={message} />;
    }

    return this.props.children;
  }
}

export default Application;
