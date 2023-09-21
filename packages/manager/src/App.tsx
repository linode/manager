import { APIError } from '@linode/api-v4/lib/types';
import '@reach/tabs/styles.css';
import { ErrorBoundary } from '@sentry/react';
import { useSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { EventWithStore, events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';

import GoTo from './GoTo';
import IdentifyUser from './IdentifyUser';
import MainContent from './MainContent';
import { ADOBE_ANALYTICS_URL, NUM_ADOBE_SCRIPTS } from './constants';
import { reportException } from './exceptionReporting';
import { useAuthentication } from './hooks/useAuthentication';
import { useFeatureFlagsLoad } from './hooks/useFeatureFlagLoad';
import { loadScript } from './hooks/useScript';
import { oauthClientsEventHandler } from './queries/accountOAuth';
import { databaseEventsHandler } from './queries/databases';
import { domainEventsHandler } from './queries/domains';
import { firewallEventsHandler } from './queries/firewalls';
import { imageEventsHandler } from './queries/images';
import {
  diskEventHandler,
  linodeEventsHandler,
} from './queries/linodes/events';
import { nodebalanacerEventHandler } from './queries/nodebalancers';
import { useMutatePreferences, usePreferences } from './queries/preferences';
import { sshKeyEventHandler } from './queries/profile';
import { supportTicketEventHandler } from './queries/support';
import { tokenEventHandler } from './queries/tokens';
import { volumeEventsHandler } from './queries/volumes';
import { ApplicationState } from './store';
import { getNextThemeValue } from './utilities/theme';

// Ensure component's display name is 'App'
export const App = () => <BaseApp />;

const BaseApp = withDocumentTitleProvider(
  withFeatureFlagProvider(
    withFeatureFlagConsumer(() => {
      const history = useHistory();

      const { data: preferences } = usePreferences();
      const { mutateAsync: updateUserPreferences } = useMutatePreferences();

      const { featureFlagsLoading } = useFeatureFlagsLoad();
      const appIsLoading = useSelector(
        (state: ApplicationState) => state.initialLoad.appIsLoading
      );
      const { loggedInAsCustomer } = useAuthentication();

      const { enqueueSnackbar } = useSnackbar();

      const [goToOpen, setGoToOpen] = React.useState(false);

      const theme = preferences?.theme;
      const keyboardListener = React.useCallback(
        (event: KeyboardEvent) => {
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
        if (
          import.meta.env.PROD &&
          !import.meta.env.REACT_APP_DISABLE_NEW_RELIC
        ) {
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
        return history.listen(({ pathname }) => {
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

      /*
       * We want to listen for migration events side-wide
       * It's unpredictable when a migration is going to happen. It could take
       * hours and it could take days. We want to notify to the user when it happens
       * and then update the Linodes in LinodesDetail and LinodesLanding
       */
      const handleMigrationEvent = React.useCallback(
        ({ event }: EventWithStore) => {
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
        },
        [enqueueSnackbar]
      );

      React.useEffect(() => {
        const eventHandlers: {
          filter: (event: EventWithStore) => boolean;
          handler: (event: EventWithStore) => void;
        }[] = [
          {
            filter: ({ event }) =>
              event.action.startsWith('database') && !event._initial,
            handler: databaseEventsHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('domain') &&
              !event._initial &&
              event.entity !== null,
            handler: domainEventsHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('volume') && !event._initial,
            handler: volumeEventsHandler,
          },
          {
            filter: ({ event }) =>
              (event.action.startsWith('image') ||
                event.action === 'disk_imagize') &&
              !event._initial,
            handler: imageEventsHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('token') && !event._initial,
            handler: tokenEventHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('user_ssh_key') && !event._initial,
            handler: sshKeyEventHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('firewall') && !event._initial,
            handler: firewallEventsHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('nodebalancer') && !event._initial,
            handler: nodebalanacerEventHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('oauth_client') && !event._initial,
            handler: oauthClientsEventHandler,
          },
          {
            filter: ({ event }) =>
              (event.action.startsWith('linode') ||
                event.action.startsWith('backups')) &&
              !event._initial,
            handler: linodeEventsHandler,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('ticket') && !event._initial,
            handler: supportTicketEventHandler,
          },
          {
            filter: ({ event }) =>
              !event._initial && ['linode_migrate'].includes(event.action),
            handler: handleMigrationEvent,
          },
          {
            filter: ({ event }) =>
              event.action.startsWith('disk') && !event._initial,
            handler: diskEventHandler,
          },
        ];

        const subscriptions = eventHandlers.map(({ filter, handler }) =>
          events$.filter(filter).subscribe(handler)
        );

        return () => {
          subscriptions.forEach((sub) => sub.unsubscribe());
        };
      }, [handleMigrationEvent]);

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
          <DocumentTitleSegment segment="Akamai Cloud Manager" />
          {featureFlagsLoading ? null : (
            <MainContent
              appIsLoading={appIsLoading}
              isLoggedInAsCustomer={loggedInAsCustomer}
            />
          )}
        </ErrorBoundary>
      );
    })
  )
);

export const hasOauthError = (...args: (APIError[] | Error | undefined)[]) => {
  return args.some((eachError) => {
    const cleanedError: JSX.Element | string = pathOr(
      '',
      [0, 'reason'],
      eachError
    );
    return typeof cleanedError !== 'string'
      ? false
      : cleanedError.toLowerCase().includes('oauth');
  });
};

export const isOSMac = navigator.userAgent.includes('Mac');
