import * as React from 'react';
import { compose } from 'recompose';
import { ThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';

import { COMPACT_SPACING_UNIT, NORMAL_SPACING_UNIT } from 'src/themeFactory';

import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';

import withPreferences, {
  PreferencesActionsProps
} from 'src/containers/preferences.container';

type ThemeChoice = 'light' | 'dark';
type SpacingChoice = 'compact' | 'normal';

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
  React.useEffect(() => {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
  });

  const toggleTheme = () => {
    document.body.classList.add('no-transition');
    /** @todo send to GA */
  };

  const toggleSpacing = () => {
    /** @todo send to GA */
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
    <PreferenceToggle
      preferenceKey="theme"
      preferenceOptions={['light', 'dark']}
      toggleCallbackFn={toggleTheme}
      /** purely for unit test purposes */
      value={props.theme}
    >
      {({
        preference: themeChoice,
        togglePreference: _toggleTheme
      }: ToggleProps<ThemeChoice>) => (
        <PreferenceToggle
          preferenceKey="spacing"
          preferenceOptions={['normal', 'compact']}
          toggleCallbackFn={toggleSpacing}
          /** purely for unit test purposes */
          value={props.spacing}
        >
          {({
            preference: spacingChoice,
            togglePreference: _toggleSpacing
          }: ToggleProps<SpacingChoice>) => (
            <ThemeProvider
              theme={safelyGetTheme(themes, themeChoice)({
                spacingOverride:
                  spacingChoice === 'compact'
                    ? COMPACT_SPACING_UNIT
                    : NORMAL_SPACING_UNIT
              })}
            >
              {typeof children === 'function'
                ? (children as RenderChildren)(_toggleTheme, _toggleSpacing)
                : children}
            </ThemeProvider>
          )}
        </PreferenceToggle>
      )}
    </PreferenceToggle>
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
