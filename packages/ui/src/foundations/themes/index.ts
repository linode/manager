import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// Themes & Brands
import { darkTheme } from './dark';
import { lightTheme } from './light';

import type { SpacingFunction } from '../utils';
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
import type {
  AliasTypes as AliasTypesLight,
  ColorTypes,
  ComponentTypes as ComponentTypesLight,
  FontTypes,
  SpacingTypes,
  TypographyTypes,
} from '@linode/design-language-system';
import type {
  AliasTypes as AliasTypesDark,
  ComponentTypes as ComponentTypesDark,
} from '@linode/design-language-system/themes/dark';

export type ThemeName = 'dark' | 'light';

type Fonts = {
  bold: TypographyTypes['Body']['Bold'];
  extrabold: TypographyTypes['Body']['Extrabold'];
  italic: TypographyTypes['Body']['Italic'];
  list: TypographyTypes['Body']['List'];
  normal: TypographyTypes['Body']['Regular'];
  semibold: TypographyTypes['Body']['Semibold'];
};

type MergeTypes<A, B> = Omit<A, keyof B> &
  Omit<B, keyof A> & { [K in keyof A & keyof B]: A[K] | B[K] };

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

type AliasTypes = MergeTypes<AliasTypesDark, AliasTypesLight>;
type ComponentTypes = MergeTypes<ComponentTypesDark, ComponentTypesLight>;

/**
 * Augmenting the Theme and ThemeOptions.
 * This allows us to add custom fields to the theme.
 * Avoid doing this unless you have a good reason.
 */
declare module '@mui/material/styles' {
  export interface Theme {
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
    inputMaxWidth: number;
    inputStyles: any;
    name: ThemeName;
    notificationToast: NotificationToast;
    spacingFunction: SpacingFunction;
    textColors: TextColors;
    tokens: {
      alias: AliasTypes;
      color: ColorTypes;
      component: ComponentTypes;
      font: FontTypes;
      spacing: SpacingTypes;
    };
    visually: any;
  }

  export interface ThemeOptions {
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
    inputMaxWidth?: number;
    inputStyles?: any;
    name: ThemeName;
    notificationToast?: NotificationToast;
    spacingFunction?: SpacingFunction;
    textColors?: DarkModeTextColors | LightModeTextColors;
    tokens?: {
      alias: AliasTypes;
      color: ColorTypes;
      component: ComponentTypes;
      font: FontTypes;
      spacing: SpacingTypes;
    };
    visually?: any;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    error: true;
  }
}

export const light = createTheme(lightTheme);
export const dark = createTheme(deepmerge(lightTheme, darkTheme));
