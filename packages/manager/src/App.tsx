import '@reach/menu-button/styles.css';
import { Account, AccountCapability } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
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
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import { events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';

import composeState from 'src/utilities/composeState';
import { MapState } from './store/types';

import IdentifyUser from './IdentifyUser';
import MainContent from './MainContent';
import MainContent_CMR from './MainContent_CMR';

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
}

type CombinedProps = Props &
  StateProps &
  RouteComponentProps &
  WithSnackbarProps &
  FeatureFlagConsumerProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false
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
          accountError={accountError}
          accountCountry={accountData ? accountData.country : undefined}
          taxID={accountData ? accountData.tax_id : undefined}
          euuid={this.props.euuid}
        />
        <DocumentTitleSegment segment="Linode Manager" />
        {this.props.featureFlagsLoading ? null : this.props.flags.cmr ? (
          <MainContent_CMR
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
        ) : (
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
        )}
      </React.Fragment>
    );
  }
}

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
  featureFlagsLoading: boolean;
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
  featureFlagsLoading: state.featureFlagsLoad.featureFlagsLoading,
  euuid: state.__resources.account.data?.euuid
});

export const connected = connect(mapStateToProps);

export default compose(
  connected,
  withDocumentTitleProvider,
  withSnackbar,
  withFeatureFlagProvider,
  withFeatureFlagConsumer
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
