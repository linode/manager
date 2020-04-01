import { Account, AccountCapability } from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { Region } from 'linode-js-sdk/lib/regions';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Action, compose } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Subscription } from 'rxjs/Subscription';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';

import { ApplicationState } from 'src/store';
import composeState from 'src/utilities/composeState';
import { configureErrorReportingUser } from './exceptionReporting';
import { MapState } from './store/types';
import { isKubernetesEnabled as _isKubernetesEnabled } from './utilities/accountCapabilities';

import DataLoadedListener from 'src/components/DataLoadedListener';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';

import IdentifyUser from './IdentifyUser';

import { initGTMUser } from './analytics';
import MainContent from './MainContent';

interface Props {
  toggleTheme: () => void;
  toggleSpacing: () => void;
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
  hasError: boolean;
  flagsLoaded: boolean;
}

type CombinedProps = Props &
  DispatchProps &
  StateProps &
  RouteComponentProps &
  WithSnackbarProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false,
    flagsLoaded: false
  };

  setFlagsLoaded = () => {
    this.setState({ flagsLoaded: true });
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  componentDidMount() {
    /**
     * Send pageviews unless blacklisted.
     */
    this.props.history.listen(({ pathname }) => {
      if ((window as any).ga) {
        (window as any).ga('send', 'pageview', pathname);
      }
    });

    // Configure error reporting to include user information.
    if (this.props.userId && this.props.username) {
      configureErrorReportingUser(
        String(this.props.userId),
        this.props.username
      );
    }

    if (this.props.euuid) {
      initGTMUser(this.props.euuid);
    }

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(
        event => !event._initial && ['linode_migrate'].includes(event.action)
      )
      .subscribe(event => {
        const { entity: migratedLinode } = event;
        if (event.action === 'linode_migrate' && event.status === 'finished') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migrated successfully.`,
            {
              variant: 'success'
            }
          );
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migration failed.`,
            {
              variant: 'error'
            }
          );
        }
      });
  }

  render() {
    const { hasError } = this.state;
    const {
      toggleSpacing,
      toggleTheme,
      linodesError,
      domainsError,
      typesError,
      imagesError,
      notificationsError,
      regionsError,
      profileError,
      volumesError,
      settingsError,
      bucketsError,
      nodeBalancersError,
      accountData,
      accountCapabilities,
      accountLoading,
      accountError,
      linodesLoading,
      accountSettingsError,
      accountSettingsLoading,
      userId,
      username
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
        domainsError,
        typesError,
        imagesError,
        notificationsError,
        regionsError,
        volumesError,
        profileError,
        settingsError,
        bucketsError,
        nodeBalancersError
      )
    ) {
      return null;
    }

    return (
      <React.Fragment>
        {/** Accessibility helpers */}
        <a href="#main-content" hidden>
          Skip to main content
        </a>
        <div hidden>
          <span id="new-window">Opens in a new window</span>
          <span id="external-site">Opens an external site</span>
          <span id="external-site-new-window">
            Opens an external site in a new window
          </span>
        </div>
        {/** Update the LD client with the user's id as soon as we know it */}
        <IdentifyUser
          userID={userId}
          username={username}
          setFlagsLoaded={this.setFlagsLoaded}
          accountError={accountError}
          accountCountry={accountData ? accountData.country : undefined}
          taxID={accountData ? accountData.tax_id : undefined}
        />
        <DataLoadedListener
          markAppAsLoaded={this.props.markAppAsDoneLoading}
          flagsHaveLoaded={this.state.flagsLoaded}
          linodesLoadedOrErrorExists={
            linodesLoading === false || !!linodesError
          }
          profileLoadedOrErrorExists={!!this.props.userId || !!profileError}
          accountLoadedOrErrorExists={
            accountLoading === false || !!accountError
          }
          accountSettingsLoadedOrErrorExists={
            accountSettingsLoading === false || !!accountSettingsError
          }
          appIsLoaded={!this.props.appIsLoading}
        />
        <DocumentTitleSegment segment="Linode Manager" />
        <MainContent
          accountCapabilities={accountCapabilities}
          accountError={accountError}
          accountLoading={accountLoading}
          history={this.props.history}
          location={this.props.location}
          toggleSpacing={toggleSpacing}
          toggleTheme={toggleTheme}
          appIsLoading={this.props.appIsLoading}
          isLoggedInAsCustomer={this.props.isLoggedInAsCustomer}
          username={username}
        />
      </React.Fragment>
    );
  }
}

interface DispatchProps {
  markAppAsDoneLoading: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    markAppAsDoneLoading: () => dispatch(handleLoadingDone())
  };
};

interface StateProps {
  /** Profile */
  linodes: Linode[];
  images?: Image[];
  types?: string[];
  regions?: Region[];
  userId?: number;
  accountData?: Account;
  username: string;
  documentation: Linode.Doc[];
  isLoggedInAsCustomer: boolean;
  accountCapabilities: AccountCapability[];
  linodesLoading: boolean;
  accountLoading: boolean;
  accountSettingsLoading: boolean;
  accountSettingsError?: APIError[];
  linodesError?: APIError[];
  volumesError?: APIError[];
  nodeBalancersError?: APIError[];
  domainsError?: APIError[];
  imagesError?: APIError[];
  bucketsError?: APIError[];
  profileError?: APIError[];
  accountError?: APIError[];
  settingsError?: APIError[];
  notificationsError?: APIError[];
  typesError?: APIError[];
  regionsError?: APIError[];
  appIsLoading: boolean;
  euuid?: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  /** Profile */
  profileError: path(['read'], state.__resources.profile.error),
  linodes: Object.values(state.__resources.linodes.itemsById),
  linodesError: path(['read'], state.__resources.linodes.error),
  domainsError: state.__resources.domains.error.read,
  imagesError: path(['read'], state.__resources.images.error),
  notificationsError: state.__resources.notifications.error,
  settingsError: state.__resources.accountSettings.error.read,
  typesError: state.__resources.types.error,
  regionsError: state.__resources.regions.error,
  userId: path(['data', 'uid'], state.__resources.profile),
  username: pathOr('', ['data', 'username'], state.__resources.profile),
  accountData: state.__resources.account.data,
  documentation: state.documentation,
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  ),
  accountCapabilities: pathOr(
    [],
    ['__resources', 'account', 'data', 'capabilities'],
    state
  ),
  accountSettingsLoading: pathOr(
    true,
    ['__resources', 'accountSettings', 'loading'],
    state
  ),
  accountSettingsError: path(
    ['__resources', 'accountSettings', 'error', 'read'],
    state
  ),
  linodesLoading: state.__resources.linodes.loading,
  accountLoading: state.__resources.account.loading,
  accountError: path(['read'], state.__resources.account.error),
  nodeBalancersError: path(['read'], state.__resources.nodeBalancers.error),
  appIsLoading: state.initialLoad.appIsLoading,
  euuid: state.__resources.account.data?.euuid
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  connected,
  withDocumentTitleProvider,
  withSnackbar,
  withFeatureFlagProvider
)(App);

export const hasOauthError = (...args: (Error | APIError[] | undefined)[]) => {
  return args.some(eachError => {
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
