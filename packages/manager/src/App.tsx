import { APIError } from '@linode/api-v4/lib/types';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import 'highlight.js/styles/a11y-dark.css';
import 'highlight.js/styles/a11y-light.css';
import { useSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import GoTo from './GoTo';
import IdentifyUser from './IdentifyUser';
import MainContent from './MainContent';
import { ADOBE_ANALYTICS_URL, NUM_ADOBE_SCRIPTS } from './constants';
import { reportException } from './exceptionReporting';
import { useAuthentication } from './hooks/useAuthentication';
import useFeatureFlagsLoad from './hooks/useFeatureFlagLoad';
import useLinodes from './hooks/useLinodes';
import { loadScript } from './hooks/useScript';
import { oauthClientsEventHandler } from './queries/accountOAuth';
import { databaseEventsHandler } from './queries/databases';
import { domainEventsHandler } from './queries/domains';
import { firewallEventsHandler } from './queries/firewalls';
import { imageEventsHandler } from './queries/images';
import { linodeEventsHandler } from './queries/linodes/events';
import { nodebalanacerEventHandler } from './queries/nodebalancers';
import { useMutatePreferences, usePreferences } from './queries/preferences';
import { sshKeyEventHandler } from './queries/profile';
import { supportTicketEventHandler } from './queries/support';
import { tokenEventHandler } from './queries/tokens';
import { volumeEventsHandler } from './queries/volumes';
import { ApplicationState } from './store';
import { getNextThemeValue } from './utilities/theme';

export const App = () => {
  const history = useHistory();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  const { featureFlagsLoading } = useFeatureFlagsLoad();
  const appIsLoading = useSelector(
    (state: ApplicationState) => state.initialLoad.appIsLoading
  );
  const { loggedInAsCustomer } = useAuthentication();

  const { enqueueSnackbar } = useSnackbar();

  const {
    linodes: {
      error: { read: linodesError },
    },
  } = useLinodes();

  const [goToOpen, setGoToOpen] = React.useState(false);

  const theme = preferences?.theme;
  const keyboardListener = React.useCallback(
    (event: KeyboardEvent) => {
      const isOSMac = navigator.userAgent.includes('Mac');
      const letterForThemeShortcut = 'D';
      const letterForGoToOpen = 'K';
      const modifierKey = isOSMac ? 'ctrlKey' : 'altKey';
      if (event[modifierKey] && event.shiftKey) {
        switch (event.key) {
          case letterForThemeShortcut:
            const currentTheme = theme;
            const newTheme = getNextThemeValue(currentTheme);

            updateUserPreferences({ theme: newTheme });
            break;
          case letterForGoToOpen:
            setGoToOpen(!goToOpen);
            break;
        }
      }
    },
    [goToOpen, theme, updateUserPreferences]
  );

  React.useEffect(() => {
    if (import.meta.env.PROD && !import.meta.env.REACT_APP_DISABLE_NEW_RELIC) {
      loadScript('/new-relic.js');
    }

    // Load Adobe Analytics Launch Script
    if (!!ADOBE_ANALYTICS_URL) {
      loadScript(ADOBE_ANALYTICS_URL, { location: 'head' })
        .then((data) => {
          const adobeScriptTags = document.querySelectorAll(
            'script[src^="https://assets.adobedtm.com/"]'
          );
          // Log an error; if the promise resolved, the _satellite object and 3 Adobe scripts should be present in the DOM.
          if (
            data.status !== 'ready' ||
            !(window as any)._satellite ||
            adobeScriptTags.length !== NUM_ADOBE_SCRIPTS
          ) {
            reportException(
              'Adobe Analytics error: Not all Adobe Launch scripts and extensions were loaded correctly; analytics cannot be sent.'
            );
          }
        })
        .catch(() => {
          // Do nothing; a user may have analytics script requests blocked.
        });
    }
  }, []);

  React.useEffect(() => {
    /**
     * Send pageviews
     */
    history.listen(({ pathname }) => {
      // Send Google Analytics page view events
      if ((window as any).ga) {
        (window as any).ga('send', 'pageview', pathname);
      }

      // Send Adobe Analytics page view events
      if ((window as any)._satellite) {
        (window as any)._satellite.track('page view', {
          url: pathname,
        });
      }
    });
  }, [history]);

  React.useEffect(() => {
    /**
     * Allow an Easter egg for toggling the theme with
     * a key combination
     */
    // eslint-disable-next-line
    document.addEventListener('keydown', keyboardListener);
    return () => {
      document.removeEventListener('keydown', keyboardListener);
    };
  }, [keyboardListener]);

  React.useEffect(() => {
    const subscriptions = [
      events$
        .filter(
          ({ event }) => event.action.startsWith('database') && !event._initial
        )
        .subscribe(databaseEventsHandler),

      events$
        .filter(
          ({ event }) =>
            event.action.startsWith('domain') &&
            !event._initial &&
            event.entity !== null
        )
        .subscribe(domainEventsHandler),

      events$
        .filter(
          ({ event }) => event.action.startsWith('volume') && !event._initial
        )
        .subscribe(volumeEventsHandler),

      events$
        .filter(
          ({ event }) =>
            (event.action.startsWith('image') ||
              event.action === 'disk_imagize') &&
            !event._initial
        )
        .subscribe(imageEventsHandler),

      events$
        .filter(
          ({ event }) => event.action.startsWith('token') && !event._initial
        )
        .subscribe(tokenEventHandler),

      events$
        .filter(
          ({ event }) =>
            event.action.startsWith('user_ssh_key') && !event._initial
        )
        .subscribe(sshKeyEventHandler),

      events$
        .filter(
          ({ event }) => event.action.startsWith('firewall') && !event._initial
        )
        .subscribe(firewallEventsHandler),

      events$
        .filter(
          ({ event }) =>
            event.action.startsWith('nodebalancer') && !event._initial
        )
        .subscribe(nodebalanacerEventHandler),

      events$
        .filter(
          ({ event }) =>
            event.action.startsWith('oauth_client') && !event._initial
        )
        .subscribe(oauthClientsEventHandler),

      events$
        .filter(
          ({ event }) =>
            (event.action.startsWith('linode') ||
              event.action.startsWith('backups')) &&
            !event._initial
        )
        .subscribe(linodeEventsHandler),

      events$
        .filter(
          ({ event }) => event.action.startsWith('ticket') && !event._initial
        )
        .subscribe(supportTicketEventHandler),

      /*
       * We want to listen for migration events side-wide
       * It's unpredictable when a migration is going to happen. It could take
       * hours and it could take days. We want to notify to the user when it happens
       * and then update the Linodes in LinodesDetail and LinodesLanding
       */
      events$
        .filter(
          ({ event }) =>
            !event._initial && ['linode_migrate'].includes(event.action)
        )
        .subscribe(({ event }) => {
          const { entity: migratedLinode } = event;
          if (
            event.action === 'linode_migrate' &&
            event.status === 'finished'
          ) {
            enqueueSnackbar(
              `Linode ${migratedLinode!.label} migrated successfully.`,
              {
                variant: 'success',
              }
            );
          }

          if (event.action === 'linode_migrate' && event.status === 'failed') {
            enqueueSnackbar(
              `Linode ${migratedLinode!.label} migration failed.`,
              {
                variant: 'error',
              }
            );
          }
        }),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [enqueueSnackbar]);

  /**
   * basically, if we get an "invalid oauth token"
   * error from the API, just render nothing because the user is
   * about to get shot off to login
   */
  if (hasOauthError(linodesError)) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<TheApplicationIsOnFire />}>
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
      <GoTo open={goToOpen} onClose={() => setGoToOpen(false)} />
      {/** Update the LD client with the user's id as soon as we know it */}
      <IdentifyUser />
      <DocumentTitleSegment segment="Linode Manager" />
      {featureFlagsLoading ? null : (
        <MainContent
          appIsLoading={appIsLoading}
          isLoggedInAsCustomer={loggedInAsCustomer}
        />
      )}
    </ErrorBoundary>
  );
};

export default compose(withFeatureFlagProvider, withFeatureFlagConsumer)(App);

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
