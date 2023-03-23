import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import { Linode } from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
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
import { firewallEventsHandler } from './queries/firewalls';

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

    /*
     * Send any Database events to the Database events handler in the queries file
     */
    events$
      .filter((event) => event.action.startsWith('database') && !event._initial)
      .subscribe(databaseEventsHandler);

    /*
     * Send any Domain events to the Domain events handler in the queries file
     */
    events$
      .filter((event) => event.action.startsWith('domain') && !event._initial)
      .subscribe(domainEventsHandler);

    /*
     * Send any Volume events to the Volume events handler in the queries file
     */
    events$
      .filter((event) => event.action.startsWith('volume') && !event._initial)
      .subscribe(volumeEventsHandler);

    /*
      Send any Image events to the Image events handler in the queries file.
    */
    events$
      .filter(
        (event) =>
          (event.action.startsWith('image') ||
            event.action === 'disk_imagize') &&
          !event._initial
      )
      .subscribe(imageEventsHandler);

    /*
      Send any Token events to the Token events handler in the queries file
     */
    events$
      .filter((event) => event.action.startsWith('token') && !event._initial)
      .subscribe(tokenEventHandler);

    /*
      Send any Token events to the Token events handler in the queries file
     */
    events$
      .filter((event) => event.action.startsWith('firewall') && !event._initial)
      .subscribe(firewallEventsHandler);

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(
        (event) => !event._initial && ['linode_migrate'].includes(event.action)
      )
      .subscribe((event) => {
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
    const {
      linodesError,
      notificationsError,
      volumesError,
      bucketsError,
      nodeBalancersError,
    } = this.props;

    if (hasError) {
      return <TheApplicationIsOnFire />;
    }

    /**
     * basically, if we get an "invalid oauth token"
     * error from the API, just render nothing because the user is
     * about to get shot off to login
     */
    if (
      hasOauthError(
        linodesError,
        notificationsError,
        volumesError,
        bucketsError,
        nodeBalancersError
      )
    ) {
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
  types?: string[];
  regions?: Region[];
  documentation: Linode.Doc[];
  isLoggedInAsCustomer: boolean;
  linodesLoading: boolean;
  linodesError?: APIError[];
  volumesError?: APIError[];
  nodeBalancersError?: APIError[];
  bucketsError?: APIError[];
  notificationsError?: APIError[];
  regionsError?: APIError[];
  appIsLoading: boolean;
  euuid?: string;
  featureFlagsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = (state) => ({
  linodes: Object.values(state.__resources.linodes.itemsById),
  linodesError: path(['read'], state.__resources.linodes.error),
  notificationsError: state.__resources.notifications.error,
  documentation: state.documentation,
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  ),
  linodesLoading: state.__resources.linodes.loading,
  nodeBalancersError: path(['read'], state.__resources.nodeBalancers.error),
  appIsLoading: state.initialLoad.appIsLoading,
  featureFlagsLoading: state.featureFlagsLoad.featureFlagsLoading,
});

export const connected = connect(mapStateToProps);

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
