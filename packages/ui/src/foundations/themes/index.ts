import { createTheme } from '@mui/material/styles';

// Themes & Brands
import { darkTheme } from './dark';
import { lightTheme, inputMaxWidth as _inputMaxWidth } from './light';

import type {
  AccentTypes as AccentTypesLight,
  ActionTypes as ActionTypesLight,
  BackgroundTypes as BackgroundTypesLight,
  BorderTypes as BorderTypesLight,
  ChartTypes,
  ContentTypes as ContentTypesLight,
  ElevationTypes as ElevationTypesLight,
  InteractionTypes as InteractionTypesLight,
  TypographyTypes,
  RadiusTypes,
} from '@linode/design-language-system';
import type {
  AccentTypes as AccentTypesDark,
  ActionTypes as ActionTypesDark,
  BackgroundTypes as BackgroundTypesDark,
  BorderTypes as BorderTypesDark,
  ContentTypes as ContentTypesDark,
  ElevationTypes as ElevationTypesDark,
  InteractionTypes as InteractionTypesDark,
} from '@linode/design-language-system/themes/dark';
import type { latoWeb } from '../fonts';
// Types & Interfaces
import type {
  customDarkModeOptions,
  notificationToast as notificationToastDark,
} from './dark';
import type {
  bg,
  borderColors,
  color,
  notificationToast,
  textColors,
} from './light';

export type ThemeName = 'dark' | 'light';

type AccentTypes = MergeTypes<AccentTypesLight, AccentTypesDark>;
type ActionTypes = MergeTypes<ActionTypesLight, ActionTypesDark>;
type BackgroundTypes = MergeTypes<BackgroundTypesLight, BackgroundTypesDark>;
type BorderTypes = MergeTypes<BorderTypesLight, BorderTypesDark>;
type ContentTypes = MergeTypes<ContentTypesLight, ContentTypesDark>;
type ElevationTypes = MergeTypes<ElevationTypesLight, ElevationTypesDark>;
type InteractionTypes = MergeTypes<InteractionTypesLight, InteractionTypesDark>;

type Fonts = typeof latoWeb;

type MergeTypes<A, B> = Omit<A, keyof B> &
  Omit<B, keyof A> &
  { [K in keyof A & keyof B]: A[K] | B[K] };

type LightModeColors = typeof color;
type DarkModeColors = typeof customDarkModeOptions.color;

type Colors = MergeTypes<LightModeColors, DarkModeColors>;

type LightModeBgColors = typeof bg;
type DarkModeBgColors = typeof customDarkModeOptions.bg;

type BgColors = MergeTypes<LightModeBgColors, DarkModeBgColors>;

type LightModeTextColors = typeof textColors;
type DarkModeTextColors = typeof customDarkModeOptions.textColors;
type TextColors = MergeTypes<LightModeTextColors, DarkModeTextColors>;

type LightModeBorderColors = typeof borderColors;
type DarkModeBorderColors = typeof customDarkModeOptions.borderColors;
type BorderColors = MergeTypes<LightModeBorderColors, DarkModeBorderColors>;

type LightNotificationToast = typeof notificationToast;
type DarkNotificationToast = typeof notificationToastDark;
type NotificationToast = MergeTypes<
  LightNotificationToast,
  DarkNotificationToast
>;

/**
 * Augmenting the Theme and ThemeOptions.
 * This allows us to add custom fields to the theme.
 * Avoid doing this unless you have a good reason.
 */
declare module '@mui/material/styles/createTheme' {
  interface Theme {
    tokens: {
      accent: AccentTypes;
      action: ActionTypes;
      background: BackgroundTypes;
      border: BorderTypes;
      chart: ChartTypes;
      content: ContentTypes;
      elevation: ElevationTypes;
      interaction: InteractionTypes;
      radius: RadiusTypes;
      typography: TypographyTypes;
    };
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg: BgColors;
    borderColors: BorderColors;
    color: Colors;
    font: Fonts;
    graphs: any;
    inputStyles: any;
    name: ThemeName;
    notificationToast: NotificationToast;
    textColors: TextColors;
    visually: any;
  }

  interface ThemeOptions {
    tokens?: {
      accent?: AccentTypes;
      action?: ActionTypes;
      background?: BackgroundTypes;
      border?: BorderTypes;
      chart?: ChartTypes;
      content?: ContentTypes;
      elevation?: ElevationTypes;
      interaction?: InteractionTypes;
      radius?: RadiusTypes;
      typography?: TypographyTypes;
    };
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg?: DarkModeBgColors | LightModeBgColors;
    borderColors?: DarkModeBorderColors | LightModeBorderColors;
    color?: DarkModeColors | LightModeColors;
    font?: Fonts;
    graphs?: any;
    inputStyles?: any;
    name: ThemeName;
    notificationToast?: NotificationToast;
    textColors?: DarkModeTextColors | LightModeTextColors;
    visually?: any;
  }
}

export const inputMaxWidth = _inputMaxWidth;
export const light = createTheme(lightTheme);
export const dark = createTheme(lightTheme, darkTheme);
