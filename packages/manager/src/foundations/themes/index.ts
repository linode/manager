import { createTheme } from '@mui/material/styles';

import { latoWeb } from 'src/foundations/fonts';
import { customDarkModeOptions, darkTheme } from 'src/foundations/themes/dark';
import {
  customDarkTokenModeOptions,
  darkThemeTokens,
} from 'src/foundations/themes/darkTokens';
import {
  bg,
  borderColors,
  color,
  textColors,
} from 'src/foundations/themes/light';
import { lightTheme } from 'src/foundations/themes/light';
import { lightThemeTokens } from 'src/foundations/themes/lightTokens';
import {
  bg as bgTokens,
  borderColors as borderColorsTokens,
  color as colorTokens,
  textColors as textColorsTokens,
} from 'src/foundations/themes/lightTokens';
import { deepMerge } from 'src/utilities/deepMerge';

export type ThemeName = 'dark' | 'light';

type Fonts = typeof latoWeb;

type MergeTypes<A, B> = Omit<A, keyof B> &
  Omit<B, keyof A> &
  { [K in keyof A & keyof B]: A[K] | B[K] };

type LightModeColors = typeof color;
type DarkModeColors = typeof customDarkModeOptions.color;
type LightTokenModeColors = typeof colorTokens;
type DarkTokenModeColors = typeof customDarkTokenModeOptions.color;

type Colors = MergeTypes<LightModeColors, DarkModeColors>;
type ColorsTokens = MergeTypes<LightTokenModeColors, DarkTokenModeColors>;

type LightModeBgColors = typeof bg;
type DarkModeBgColors = typeof customDarkModeOptions.bg;
type LightModeBgColorsTokens = typeof bgTokens;
type DarkModeBgColorsTokens = typeof customDarkTokenModeOptions.bg;

type BgColors = MergeTypes<LightModeBgColors, DarkModeBgColors>;
type BgColorsTokens = MergeTypes<
  LightModeBgColorsTokens,
  DarkModeBgColorsTokens
>;

type LightModeTextColors = typeof textColors;
type DarkModeTextColors = typeof customDarkModeOptions.textColors;
type LightModeTextColorsTokens = typeof textColorsTokens;
type DarkModeTextColorsTokens = typeof customDarkTokenModeOptions.textColors;

type TextColors = MergeTypes<LightModeTextColors, DarkModeTextColors>;
type TextColorsTokens = MergeTypes<
  LightModeTextColorsTokens,
  DarkModeTextColorsTokens
>;

type LightModeBorderColors = typeof borderColors;
type DarkModeBorderColors = typeof customDarkModeOptions.borderColors;
type LightModeBorderColorsTokens = typeof borderColorsTokens;
type DarkModeBorderColorsTokens = typeof customDarkTokenModeOptions.borderColors;

type BorderColors = MergeTypes<LightModeBorderColors, DarkModeBorderColors>;
type BorderColorsTokens = MergeTypes<
  LightModeBorderColorsTokens,
  DarkModeBorderColorsTokens
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
    bg: BgColors | BgColorsTokens;
    borderColors: BorderColors | BorderColorsTokens;
    color: Colors | ColorsTokens;
    font: Fonts;
    graphs: any;
    inputStyles?: any;
    name: ThemeName;
    textColors: TextColors | TextColorsTokens;
    visually: any;
  }

  interface ThemeOptions {
    addCircleHoverEffect?: any;
    animateCircleIcon?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
    bg?:
      | DarkModeBgColors
      | DarkModeBgColorsTokens
      | LightModeBgColors
      | LightModeBgColorsTokens;
    borderColors?:
      | DarkModeBorderColors
      | DarkModeBorderColorsTokens
      | LightModeBorderColors
      | LightModeBorderColorsTokens;
    color?:
      | DarkModeColors
      | DarkTokenModeColors
      | LightModeColors
      | LightTokenModeColors;
    font?: Fonts;
    graphs?: any;
    inputStyles?: any;
    name: ThemeName;
    textColors?:
      | DarkModeTextColors
      | DarkModeTextColorsTokens
      | LightModeTextColors
      | LightModeTextColorsTokens;
    visually?: any;
  }
}

export const light = createTheme(lightTheme);
export const dark = createTheme(deepMerge(lightTheme, darkTheme));
export const lightTokens = createTheme(lightThemeTokens);
export const darkTokens = createTheme(
  deepMerge(lightThemeTokens, darkThemeTokens)
);
