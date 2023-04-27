import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';
import { Subscription } from 'rxjs/Subscription';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import 'highlight.js/styles/a11y-light.css';
import 'highlight.js/styles/a11y-dark.css';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import { events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import composeState from 'src/utilities/composeState';
import { MapState } from './store/types';
import IdentifyUser from './IdentifyUser';
import MainContent from './MainContent';
import GoTo from './GoTo';
import { databaseEventsHandler } from './queries/databases';
import { domainEventsHandler } from './queries/domains';
import { volumeEventsHandler } from './queries/volumes';
import { imageEventsHandler } from './queries/images';
import { tokenEventHandler } from './queries/tokens';
import withPreferences, {
  PreferencesActionsProps,
  PreferencesStateProps,
} from './containers/preferences.container';
import { loadScript } from './hooks/useScript';
import { getNextThemeValue } from './utilities/theme';
import { sshKeyEventHandler } from './queries/profile';
import { firewallEventsHandler } from './queries/firewalls';
import { nodebalanacerEventHandler } from './queries/nodebalancers';
import { oauthClientsEventHandler } from './queries/accountOAuth';
import { ADOBE_ANALYTICS_URL } from './constants';
import { linodeEventsHandler } from './queries/linodes/events';

interface Props {
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
  hasError: boolean;
  goToOpen: boolean;
}

type CombinedProps = Props &
  StateProps &
  RouteComponentProps &
  WithSnackbarProps &
  FeatureFlagConsumerProps &
  PreferencesStateProps &
  PreferencesActionsProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false,
    goToOpen: false,
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  componentDidMount() {
    if (import.meta.env.PROD && !import.meta.env.REACT_APP_DISABLE_NEW_RELIC) {
      loadScript('/new-relic.js');
    }

    // Load Adobe Analytics Launch Script
    if (!!ADOBE_ANALYTICS_URL) {
      loadScript(ADOBE_ANALYTICS_URL, { location: 'head' });
    }

    /**
     * Send pageviews unless blocklisted.
     */
    this.props.history.listen(({ pathname }) => {
      if ((window as any).ga) {
        (window as any).ga('send', 'pageview', pathname);
      }
    });

    /**
     * Allow an Easter egg for toggling the theme with
     * a key combination
     */
    // eslint-disable-next-line
    document.addEventListener('keydown', this.keyboardListener);

    events$
      .filter(
        ({ event }) => event.action.startsWith('database') && !event._initial
      )
      .subscribe(databaseEventsHandler);

    events$
      .filter(
        ({ event }) =>
          event.action.startsWith('domain') &&
          !event._initial &&
          event.entity !== null
      )
      .subscribe(domainEventsHandler);

    events$
      .filter(
        ({ event }) => event.action.startsWith('volume') && !event._initial
      )
      .subscribe(volumeEventsHandler);

    events$
      .filter(
        ({ event }) =>
          (event.action.startsWith('image') ||
            event.action === 'disk_imagize') &&
          !event._initial
      )
      .subscribe(imageEventsHandler);

    events$
      .filter(
        ({ event }) => event.action.startsWith('token') && !event._initial
      )
      .subscribe(tokenEventHandler);

    events$
      .filter(
        ({ event }) =>
          event.action.startsWith('user_ssh_key') && !event._initial
      )
      .subscribe(sshKeyEventHandler);

    events$
      .filter(
        ({ event }) => event.action.startsWith('firewall') && !event._initial
      )
      .subscribe(firewallEventsHandler);

    events$
      .filter(
        ({ event }) =>
          event.action.startsWith('nodebalancer') && !event._initial
      )
      .subscribe(nodebalanacerEventHandler);

    events$
      .filter(
        ({ event }) =>
          event.action.startsWith('oauth_client') && !event._initial
      )
      .subscribe(oauthClientsEventHandler);

    events$
      .filter(
        ({ event }) => event.action.startsWith('linode') && !event._initial
      )
      .subscribe(linodeEventsHandler);

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(
        ({ event }) =>
          !event._initial && ['linode_migrate'].includes(event.action)
      )
      .subscribe(({ event }) => {
        const { entity: migratedLinode } = event;
        if (event.action === 'linode_migrate' && event.status === 'finished') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migrated successfully.`,
            {
              variant: 'success',
            }
          );
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migration failed.`,
            {
              variant: 'error',
            }
          );
        }
      });
  }
  componentWillUnmount(): void {
    document.removeEventListener('keydown', this.keyboardListener);
  }

  keyboardListener = (event: KeyboardEvent) => {
    const isOSMac = navigator.userAgent.includes('Mac');
    const letterForThemeShortcut = 'D';
    const letterForGoToOpen = 'K';
    const modifierKey = isOSMac ? 'ctrlKey' : 'altKey';
    if (event[modifierKey] && event.shiftKey) {
      switch (event.key) {
        case letterForThemeShortcut:
          const currentTheme = this.props.preferences?.theme;
          const newTheme = getNextThemeValue(currentTheme);

          this.props.updateUserPreferences({ theme: newTheme });
          break;
        case letterForGoToOpen:
          this.setState((prevState) => ({
            ...prevState,
            goToOpen: !prevState.goToOpen,
          }));
          break;
      }
    }
  };

  goToClose = () => {
    this.setState({ goToOpen: false });
  };

  render() {
    const { hasError } = this.state;
    const { linodesError } = this.props;

    if (hasError) {
      return <TheApplicationIsOnFire />;
    }

    /**
     * basically, if we get an "invalid oauth token"
     * error from the API, just render nothing because the user is
     * about to get shot off to login
     */
    if (hasOauthError(linodesError)) {
      return null;
    }

    return (
      <React.Fragment>
        {/** Accessibility helper */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div hidden>
          <span id="new-window">Opens in a new window</span>
          <span id="external-site">Opens an external site</span>
          <span id="external-site-new-window">
            Opens an external site in a new window
          </span>
        </div>
        <GoTo open={this.state.goToOpen} onClose={this.goToClose} />
        {/** Update the LD client with the user's id as soon as we know it */}
        <IdentifyUser />
        <DocumentTitleSegment segment="Linode Manager" />
        {this.props.featureFlagsLoading ? null : (
          <MainContent
            history={this.props.history}
            location={this.props.location}
            appIsLoading={this.props.appIsLoading}
            isLoggedInAsCustomer={this.props.isLoggedInAsCustomer}
          />
        )}
      </React.Fragment>
    );
  }
}

interface StateProps {
  linodes: Linode[];
  isLoggedInAsCustomer: boolean;
  linodesLoading: boolean;
  linodesError?: APIError[];
  bucketsError?: APIError[];
  appIsLoading: boolean;
  euuid?: string;
  featureFlagsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = (state) => ({
  linodes: Object.values(state.__resources.linodes.itemsById),
  linodesError: path(['read'], state.__resources.linodes.error),
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  ),
  linodesLoading: state.__resources.linodes.loading,
  appIsLoading: state.initialLoad.appIsLoading,
  featureFlagsLoading: state.featureFlagsLoad.featureFlagsLoading,
});

const connected = connect(mapStateToProps);

export default compose(
  connected,
  withDocumentTitleProvider,
  withSnackbar,
  withFeatureFlagProvider,
  withFeatureFlagConsumer,
  withPreferences
)(App);

export const hasOauthError = (...args: (Error | APIError[] | undefined)[]) => {
  return args.some((eachError) => {
    const cleanedError: string | JSX.Element = pathOr(
      '',
      [0, 'reason'],
      eachError
    );
    return typeof cleanedError !== 'string'
      ? false
      : cleanedError.toLowerCase().includes('oauth');
  });
};
