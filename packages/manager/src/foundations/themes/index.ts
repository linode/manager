import { createTheme } from '@mui/material/styles';
import _merge from 'lodash/merge';

import { latoWeb } from 'src/foundations/fonts';
// Types & Interfaces
import { customDarkModeOptions } from 'src/foundations/themes/dark';
// Themes & Brands
import { darkTheme } from 'src/foundations/themes/dark';
import {
  bg,
  borderColors,
  color,
  textColors,
} from 'src/foundations/themes/light';
import { lightTheme } from 'src/foundations/themes/light';

export type ThemeName = 'dark' | 'light';

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
    color: Colors;
    font: Fonts;
    graphs: any;
    name: ThemeName;
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
    color?: DarkModeColors | LightModeColors;
    font?: Fonts;
    graphs?: any;
    name: ThemeName;
    textColors?: DarkModeTextColors | LightModeTextColors;
    visually?: any;
  }
}

export const light = createTheme(lightTheme);
export const dark = createTheme(_merge(lightTheme, darkTheme));
