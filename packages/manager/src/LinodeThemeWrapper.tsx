import * as React from 'react';
import { compose } from 'recompose';
import { ThemeProvider } from 'src/components/core/styles';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import withPreferences, {
  PreferencesActionsProps,
} from 'src/containers/preferences.container';
import { dark, light } from 'src/themes';
import {
  sendCurrentThemeSettingsEvent,
  sendThemeToggleEvent,
} from 'src/utilities/ga';

export type ThemeChoice = 'light' | 'dark';

type RenderChildren = (toggle: () => void) => React.ReactNode;

interface Props {
  children: RenderChildren | React.ReactNode;
  /**
   * override base theme with props
   * this is mostly so the unit tests work
   */
  theme?: ThemeChoice;
}

const themes = { light, dark };

type CombinedProps = Props & PreferencesActionsProps;

const setActiveHighlightTheme = (value: ThemeChoice) => {
  /**
   * Disable the inactive highlight.js theme when we toggle
   * the app theme. This looks horrible but it is the recommended approach:
   * https://github.com/highlightjs/highlight.js/blob/master/demo/demo.js
   */
  const inactiveTheme = value === 'dark' ? 'a11y-light' : 'a11y-dark';
  const links = document.querySelectorAll('style');
  links.forEach((thisLink: any) => {
    const content = thisLink?.textContent ?? '';
    // We're matching a comment in the style tag's text contents :groan:
    thisLink.disabled = content.match(inactiveTheme);
  });
};

const LinodeThemeWrapper: React.FC<CombinedProps> = (props) => {
  const toggleTheme = (value: ThemeChoice) => {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
    setActiveHighlightTheme(value);
    /** send to GA */
    sendThemeToggleEvent(value);
  };

  const setThemePrefsOnAppLoad = (value: ThemeChoice) => {
    /** send to GA */
    sendCurrentThemeSettingsEvent(value);
  };

  React.useEffect(() => {
    /** request the user preferences on app load */
    props
      .getUserPreferences()
      .then((response) => {
        // Without the timeout a race condition sometimes runs the theme
        // highlight checker before the stylesheets have fully loaded.
        window.setTimeout(
          () => setActiveHighlightTheme(response?.theme ?? 'light'),
          1000
        );
      })
      .catch(
        () =>
          /** swallow the error. PreferenceToggle.tsx handles failures gracefully */ null
      );
  }, []);

  const { children } = props;

  return (
    <PreferenceToggle<'light' | 'dark'>
      preferenceKey="theme"
      preferenceOptions={['light', 'dark']}
      toggleCallbackFnDebounced={toggleTheme}
      /** purely for unit test purposes */
      value={props.theme}
      initialSetCallbackFn={setThemePrefsOnAppLoad}
      localStorageKey="themeChoice"
    >
      {({
        preference: themeChoice,
        togglePreference: _toggleTheme,
      }: ToggleProps<ThemeChoice>) => (
        <MemoizedThemeProvider
          themeChoice={themeChoice}
          toggleTheme={_toggleTheme}
        >
          {children}
        </MemoizedThemeProvider>
      )}
    </PreferenceToggle>
  );
};

interface MemoizedThemeProviderProps {
  themeChoice: ThemeChoice;
  toggleTheme: () => ThemeChoice;
  children: any;
}

const MemoizedThemeProvider: React.FC<MemoizedThemeProviderProps> = (props) => {
  const { themeChoice, toggleTheme, children } = props;

  const theme = React.useMemo(() => {
    const themeCreator = safelyGetTheme(themes, themeChoice);

    return themeCreator();
  }, [themeChoice]);

  return (
    <ThemeProvider theme={theme}>
      {typeof children === 'function'
        ? (children as RenderChildren)(toggleTheme)
        : children}
    </ThemeProvider>
  );
};

/** safely return light theme if the theme choice isn't "light" or "dark" */
const safelyGetTheme = (
  themesToChoose: Record<'dark' | 'light', any>,
  themeChoice: string
) => {
  /* tslint:disable */
  return !!Object.keys(themesToChoose).some(
    (eachTheme) => eachTheme === themeChoice
  )
    ? themesToChoose[themeChoice]
    : themesToChoose['light'];
};

export default compose<CombinedProps, Props>(withPreferences())(
  LinodeThemeWrapper
);
