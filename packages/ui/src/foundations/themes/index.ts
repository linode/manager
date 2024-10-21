import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// Themes & Brands
import { darkTheme } from './dark';
import { lightTheme } from './light';

import type {
  ChartTypes,
  InteractionTypes as InteractionTypesLight,
} from '@linode/design-language-system';
import type { InteractionTypes as InteractionTypesDark } from '@linode/design-language-system/themes/dark';
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
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg: BgColors;
    borderColors: BorderColors;
    chartTokens: ChartTypes;
    color: Colors;
    font: Fonts;
    graphs: any;
    inputMaxWidth: number;
    inputStyles: any;
    interactionTokens: InteractionTypes;
    name: ThemeName;
    notificationToast: NotificationToast;
    textColors: TextColors;
    visually: any;
  }

  interface ThemeOptions {
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg?: DarkModeBgColors | LightModeBgColors;
    borderColors?: DarkModeBorderColors | LightModeBorderColors;
    chartTokens?: ChartTypes;
    color?: DarkModeColors | LightModeColors;
    font?: Fonts;
    graphs?: any;
    inputMaxWidth?: number;
    inputStyles?: any;
    interactionTokens?: InteractionTypes;
    name: ThemeName;
    notificationToast?: NotificationToast;
    textColors?: DarkModeTextColors | LightModeTextColors;
    visually?: any;
  }
}

export const light = createTheme(lightTheme);
export const dark = createTheme(deepmerge(lightTheme, darkTheme));
