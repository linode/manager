import * as React from 'react';
import { compose } from 'recompose';
import { ThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';

import { COMPACT_SPACING_UNIT, NORMAL_SPACING_UNIT } from 'src/themeFactory';

import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import withPreferences, {
  PreferencesActionsProps
} from 'src/containers/preferences.container';
import {
  sendCurrentThemeSettingsEvent,
  sendSpacingToggleEvent,
  sendThemeToggleEvent
} from 'src/utilities/ga';

export type ThemeChoice = 'light' | 'dark';
export type SpacingChoice = 'compact' | 'normal';

type RenderChildren = (
  toggle: () => void,
  spacing: () => void
) => React.ReactNode;

interface Props {
  children: RenderChildren | React.ReactNode;
  /**
   * override base theme with props
   * this is mostly so the unit tests work
   */
  theme?: ThemeChoice;
  spacing?: SpacingChoice;
}

const themes = { light, dark };

type CombinedProps = Props & PreferencesActionsProps;

const LinodeThemeWrapper: React.FC<CombinedProps> = props => {
  const toggleTheme = (value: ThemeChoice) => {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
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
    /** send to GA */
    sendThemeToggleEvent(value);
  };

  const toggleSpacing = (value: SpacingChoice) => {
    /** send to GA */
    sendSpacingToggleEvent(value);
  };

  const setThemePrefsOnAppLoad = (value: ThemeChoice | SpacingChoice) => {
    /** send to GA */
    sendCurrentThemeSettingsEvent(value);
  };

  React.useEffect(() => {
    /** request the user preferences on app load */
    props
      .getUserPreferences()
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
        togglePreference: _toggleTheme
      }: ToggleProps<ThemeChoice>) => (
        <PreferenceToggle<'normal' | 'compact'>
          preferenceKey="spacing"
          preferenceOptions={['normal', 'compact']}
          toggleCallbackFnDebounced={toggleSpacing}
          /** purely for unit test purposes */
          value={props.spacing}
          initialSetCallbackFn={setThemePrefsOnAppLoad}
          localStorageKey="spacingChoice"
        >
          {({
            preference: spacingChoice,
            togglePreference: _toggleSpacing
          }: ToggleProps<SpacingChoice>) => (
            <MemoizedThemeProvider
              themeChoice={themeChoice}
              spacingChoice={spacingChoice}
              toggleTheme={_toggleTheme}
              toggleSpacing={_toggleSpacing}
            >
              {children}
            </MemoizedThemeProvider>
          )}
        </PreferenceToggle>
      )}
    </PreferenceToggle>
  );
};

interface MemoizedThemeProviderProps {
  themeChoice: ThemeChoice;
  spacingChoice: SpacingChoice;
  toggleTheme: () => ThemeChoice;
  toggleSpacing: () => SpacingChoice;
  children: any;
}

const MemoizedThemeProvider: React.FC<MemoizedThemeProviderProps> = props => {
  const {
    themeChoice,
    toggleTheme,
    spacingChoice,
    toggleSpacing,
    children
  } = props;

  const theme = React.useMemo(() => {
    const themeCreator = safelyGetTheme(themes, themeChoice);

    const spacingUnit =
      spacingChoice === 'compact' ? COMPACT_SPACING_UNIT : NORMAL_SPACING_UNIT;

    return themeCreator(spacingUnit);
  }, [themeChoice, spacingChoice]);

  return (
    <ThemeProvider theme={theme}>
      {typeof children === 'function'
        ? (children as RenderChildren)(toggleTheme, toggleSpacing)
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
    eachTheme => eachTheme === themeChoice
  )
    ? themesToChoose[themeChoice]
    : themesToChoose['light'];
};

export default compose<CombinedProps, Props>(withPreferences())(
  LinodeThemeWrapper
);
