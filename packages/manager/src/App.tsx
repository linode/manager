import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import 'highlight.js/styles/a11y-dark.css';
import 'highlight.js/styles/a11y-light.css';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import GoTo from './GoTo';
import IdentifyUser from './IdentifyUser';
import MainContent from './MainContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ADOBE_ANALYTICS_URL, NUM_ADOBE_SCRIPTS } from './constants';
import { reportException } from './exceptionReporting';
import { useAppEventHandlers } from './hooks/useAppEventHandlers';
import { useAuthentication } from './hooks/useAuthentication';
import useFeatureFlagsLoad from './hooks/useFeatureFlagLoad';
import { loadScript } from './hooks/useScript';
import { useToastNotifications } from './hooks/useToastNotifications';
import { useMutatePreferences, usePreferences } from './queries/preferences';
import { ApplicationState } from './store';
import { getNextThemeValue } from './utilities/theme';

// Ensure component's display name is 'App'
export const App = () => <BaseApp />;

const BaseApp = withFeatureFlagProvider(
  withFeatureFlagConsumer(() => {
    const history = useHistory();

    const { data: preferences } = usePreferences();
    const { mutateAsync: updateUserPreferences } = useMutatePreferences();

    const { featureFlagsLoading } = useFeatureFlagsLoad();
    const appIsLoading = useSelector(
      (state: ApplicationState) => state.initialLoad.appIsLoading
    );
    const { loggedInAsCustomer } = useAuthentication();

    useAppEventHandlers();
    useToastNotifications();

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
  })
);

export const isOSMac = navigator.userAgent.includes('Mac');
