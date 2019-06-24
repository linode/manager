import { equals, path } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { ThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';

import { COMPACT_SPACING_UNIT, NORMAL_SPACING_UNIT } from 'src/themeFactory';

import withProfile, {
  ProfileActionsProps
} from 'src/containers/profile.container';

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

type CombinedProps = Props & ProfileProps & ProfileActionsProps;

const LinodeThemeWrapper: React.FC<CombinedProps> = props => {
  const [theme, setTheme] = React.useState<ThemeChoice | undefined>(
    props.theme
  );
  const [spacing, setSpacing] = React.useState<SpacingChoice | undefined>(
    props.spacing
  );
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  React.useEffect(() => {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
  });

  React.useEffect(() => {
    const debouncedErrorUpdate = setTimeout(() => {
      /**
       * we have a profile error, so first GET the preferences
       * before trying to update them.
       *
       * Don't update anything if the GET fails
       */
      if (!!props.profileError) {
        props
          .getProfile()
          .then(response => {
            props.updateProfile({
              preferences: {
                ...response.preferences,
                theme,
                spacing
              }
            });
          })
          .catch(() => /** swallow the error */ null);
      } else {
        /** only PUT if our preferences are not equal to the spacing and
         * theme in local state. This might be the case if the user is toggling between
         * the theme very quickly
         *
         * or if the app first loaded and the preferences and local state are equal
         */
        if (
          !!props.preferences &&
          theme &&
          spacing
          // && preferencesHaveBeenUpdated(props.preferences, theme, spacing)
        ) {
          props.updateProfile({
            preferences: {
              ...props.preferences,
              theme,
              spacing
            }
          });
        }
      }
    }, 750);

    return () => clearTimeout(debouncedErrorUpdate);
  }, [theme, spacing]);

  React.useEffect(() => {
    /**
     * This useEffect is strictly for when the app first loads
     * whether we have a profile error or profile data
     */

    /**
     * if for whatever reason we failed to get the preferences data
     * just fallback to some defaults.
     *
     * Do NOT try and PUT to the API - we don't want to overwrite other unrelated preferences
     */
    if (!!props.profileError && lastUpdated === 0) {
      setSpacing('normal');
      setTheme('light');

      setLastUpdated(Date.now());
    }

    /**
     * In the case of when we successfully retrieved preferences for the FIRST time,
     * set the state to what we got from the server. If the preference
     * doesn't exist yet in this user's payload, set defaults in local state.
     */
    if (!!props.preferences && lastUpdated === 0) {
      const themeFromAPI = path<ThemeChoice>(['theme'], props.preferences);
      const spacingFromAPI = path<SpacingChoice>(
        ['spacing'],
        props.preferences
      );

      /** this is the first time the user is setting the user preference */
      if (!themeFromAPI) {
        setTheme('light');
      } else {
        setTheme(themeFromAPI);
      }

      /** this is the first time the user is setting the user preference */
      if (!spacingFromAPI) {
        setSpacing('normal');
      } else {
        setSpacing(spacingFromAPI);
      }

      /** set local state so we don't repeat any of this previous behavior */
      setLastUpdated(Date.now());
    }
  }, [props.profileError, props.preferences]);

  const toggleTheme = () => {
    document.body.classList.add('no-transition');
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const toggleSpacing = () => {
    if (spacing === 'compact') {
      setSpacing('normal');
    } else {
      setSpacing('compact');
    }
  };

  React.useEffect(() => {
    /** request the profile on app load */
    props.getProfile();
  }, []);

  const { children } = props;

  if (!theme || !spacing) {
    return <span>hello world</span>;
  }

  const themeChoice = themes[theme];

  const spacingUnit =
    spacing === 'compact' ? COMPACT_SPACING_UNIT : NORMAL_SPACING_UNIT;

  return (
    <ThemeProvider
      theme={themeChoice({
        spacingOverride: spacingUnit
      })}
    >
      {isRenderChildren(children)
        ? children(toggleTheme, toggleSpacing)
        : children}
    </ThemeProvider>
  );
};
const isRenderChildren = (
  c: RenderChildren | React.ReactNode
): c is RenderChildren => {
  return typeof c === 'function';
};

interface ProfileProps {
  preferences?: Record<string, any>;
  profileError?: any;
  preferencesLastUpdated: number;
}

const memoized = (component: React.FC<CombinedProps>) =>
  React.memo(component, (prevProps, nextProps) => {
    /**
     * only prevent rendering if the preferences AND profileError
     * went from being defined to defined or vise versa.
     *
     * we don't care to re-render if the preferences have been updated in Redux
     * state. All the relevant preference state will be handled in the component.
     * This component only cares about what the preferences are on app load.
     */
    return (
      !(!prevProps.preferences && !!nextProps.preferences) &&
      !(!!prevProps.preferences && !nextProps.preferences) &&
      !(!prevProps.profileError && !!nextProps.profileError) &&
      !(!!prevProps.profileError && !nextProps.profileError) &&
      equals(prevProps.children, nextProps.children) &&
      /** we only care what the server tells us on app load */
      !(
        prevProps.preferencesLastUpdated === 0 &&
        nextProps.preferencesLastUpdated !== 0
      )
    );
  });

export default compose<CombinedProps, Props>(
  withProfile<ProfileProps, Props>((ownProps, profile) => ({
    preferences: path(['preferences'], profile.data),
    profileError: path(['error'], profile),
    preferencesLastUpdated: profile.lastUpdated
  })),
  memoized
)(LinodeThemeWrapper);

// const preferencesHaveBeenUpdated =
//   (preferences: Record<string, any>, theme: ThemeChoice, spacing: SpacingChoice) => {
//     return path(['theme'], preferences) !== theme
//       || path(['spacing'], preferences) !== spacing
//   }
