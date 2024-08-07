import { createTheme } from '@mui/material/styles';

// Themes & Brands
import { darkTheme } from 'src/foundations/themes/dark';
import { lightTheme } from 'src/foundations/themes/light';
import { deepMerge } from 'src/utilities/deepMerge';

import type { Chart as ChartLight } from '@linode/design-language-system';
import type { Chart as ChartDark } from '@linode/design-language-system/themes/dark';
import type { latoWeb } from 'src/foundations/fonts';
// Types & Interfaces
import type {
  customDarkModeOptions,
  notificationToast as notificationToastDark,
} from 'src/foundations/themes/dark';
import type {
  bg,
  borderColors,
  color,
  notificationToast,
  textColors,
} from 'src/foundations/themes/light';

export type ThemeName = 'dark' | 'light';

type ChartLightTypes = typeof ChartLight;
type ChartDarkTypes = typeof ChartDark;
type ChartTypes = MergeTypes<ChartLightTypes, ChartDarkTypes>;

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
    charts: ChartTypes;
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
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg?: DarkModeBgColors | LightModeBgColors;
    borderColors?: DarkModeBorderColors | LightModeBorderColors;
    charts: ChartTypes;
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

export const light = createTheme(lightTheme);
export const dark = createTheme(deepMerge(lightTheme, darkTheme));
