import * as React from 'react';
import { compose } from 'recompose';
import { ThemeProvider } from 'src/components/core/styles';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import withPreferences, {
  PreferencesActionsProps,
} from 'src/containers/preferences.container';
import { dark, light } from 'src/themes';
import { isProductionBuild } from './constants';

export type ThemeChoice = 'light' | 'dark';

type RenderChildren = (toggle: () => void) => React.ReactNode;

interface Props {
  children: RenderChildren | React.ReactNode;
  /**
   * override base theme with props
   * this is mostly so the unit tests work
   */
  theme?: ThemeChoice;
  shouldGetPreferences?: boolean;
}

const themes = { light, dark };

type CombinedProps = Props & PreferencesActionsProps;

const setActiveHighlightTheme = (value: ThemeChoice) => {
  /**
   * Disable the inactive highlight.js theme when we toggle
   * the app theme. This looks horrible but it is the recommended approach:
   * https://github.com/highlightjs/highlight.js/blob/master/demo/demo.js
   */

  // Get all the <style>...</style> tags currently rendered.
  // We do this because Webpack writes our CSS into these html tags.
  const links = document.querySelectorAll('style');

  links.forEach((thisLink: any) => {
    // Get the inner content of style tag as a text string
    const content: string = thisLink?.textContent ?? '';

    const isHighlightJS = content.match('.hljs');

    const darkColor = isProductionBuild
      ? 'background:#2b2b2b;'
      : 'background: #2b2b2b;';

    const lightColor = isProductionBuild
      ? 'background:#fefefe;'
      : 'background: #fefefe;';

    // If the CSS string contains .hljs and background: #2b2b2b; we can safely assume
    // we are currently using a11y-dark.css
    if (isHighlightJS && content.match(darkColor)) {
      // If we are in dark mode, disable the dark mode css if the new theme is light
      thisLink.disabled = value === 'light';
    }

    // If the CSS string contains .hljs and background: #fefefe; we can safely assume
    // we are currently using a11y-light.css
    if (isHighlightJS && content.match(lightColor)) {
      // If we are in light mode, disable the light mode css if the new theme is dark
      thisLink.disabled = value === 'dark';
    }
  });
};

const LinodeThemeWrapper: React.FC<CombinedProps> = (props) => {
  const { children, shouldGetPreferences = true } = props;
  const toggleTheme = (value: ThemeChoice) => {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
    setActiveHighlightTheme(value);
  };

  React.useEffect(() => {
    if (shouldGetPreferences) {
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
    }
  }, []);

  return (
    <PreferenceToggle<'light' | 'dark'>
      preferenceKey="theme"
      preferenceOptions={['light', 'dark']}
      toggleCallbackFnDebounced={toggleTheme}
      /** purely for unit test purposes */
      value={props.theme}
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
