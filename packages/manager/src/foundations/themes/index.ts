import { createTheme } from '@mui/material/styles';
import _merge from 'lodash/merge';

// Themes & Brands
import { darkTheme } from 'src/foundations/themes/dark';
import { lightTheme } from 'src/foundations/themes/light';

// Types & Interfaces
import { customDarkModeOptions } from 'src/foundations/themes/dark';
import { latoWeb } from 'src/foundations/fonts';
import {
  color,
  bg,
  textColors,
  borderColors,
} from 'src/foundations/themes/light';

export type ThemeName = 'light' | 'dark';

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
    name: ThemeName;
    bg: BgColors;
    color: Colors;
    textColors: TextColors;
    borderColors: BorderColors;
    font: Fonts;
    graphs: any;
    visually: any;
    animateCircleIcon?: any;
    addCircleHoverEffect?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
  }

  interface ThemeOptions {
    name: ThemeName;
    bg?: LightModeBgColors | DarkModeBgColors;
    color?: LightModeColors | DarkModeColors;
    textColors?: LightModeTextColors | DarkModeTextColors;
    borderColors?: LightModeBorderColors | DarkModeBorderColors;
    font?: Fonts;
    graphs?: any;
    visually?: any;
    animateCircleIcon?: any;
    addCircleHoverEffect?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;
  }
}

export const light = createTheme(lightTheme);
export const dark = createTheme(_merge(lightTheme, darkTheme));
