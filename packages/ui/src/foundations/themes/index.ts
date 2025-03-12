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
  AccentTypes as AccentTypesLight,
  ActionTypes as ActionTypesLight,
  BackgroundTypes as BackgroundTypesLight,
  BorderRadiusTypes,
  BorderTypes as BorderTypesLight,
  CalendarTypes as CalendarTypesLight,
  ChartTypes,
  ColorTypes,
  ContentTypes as ContentTypesLight,
  DropdownTypes as DropdownTypesLight,
  ElevationTypes as ElevationTypesLight,
  FontTypes,
  GlobalFooterTypes as GlobalFooterTypesLight,
  GlobalHeaderTypes,
  InteractionTypes as InteractionTypesLight,
  RadioButtonTypes as RadioButtonTypesLight,
  RadiusTypes,
  SearchTypes as SearchTypesLight,
  SideNavigationTypes as SideNavigationTypesLight,
  SpacingTypes,
  TableTypes as TableTypesLight,
  TextFieldTypes as TextFieldTypesLight,
  TypographyTypes,
} from '@linode/design-language-system';
import type {
  AccentTypes as AccentTypesDark,
  ActionTypes as ActionTypesDark,
  BackgroundTypes as BackgroundTypesDark,
  BorderTypes as BorderTypesDark,
  CalendarTypes as CalendarTypesDark,
  ContentTypes as ContentTypesDark,
  DropdownTypes as DropdownTypesDark,
  ElevationTypes as ElevationTypesDark,
  GlobalFooterTypes as GlobalFooterTypesDark,
  InteractionTypes as InteractionTypesDark,
  RadioButtonTypes as RadioButtonTypesDark,
  SearchTypes as SearchTypesDark,
  SideNavigationTypes as SideNavigationTypesDark,
  TableTypes as TableTypesDark,
  TextFieldTypes as TextFieldTypesDark,
} from '@linode/design-language-system/themes/dark';

export type ThemeName = 'dark' | 'light';

type FooterTypes = MergeTypes<GlobalFooterTypesLight, GlobalFooterTypesDark>;
type SearchTypes = MergeTypes<SearchTypesLight, SearchTypesDark>;
type AccentTypes = MergeTypes<AccentTypesLight, AccentTypesDark>;
type ActionTypes = MergeTypes<ActionTypesLight, ActionTypesDark>;
type BackgroundTypes = MergeTypes<BackgroundTypesLight, BackgroundTypesDark>;
type BorderTypes = MergeTypes<BorderTypesLight, BorderTypesDark>;
type ContentTypes = MergeTypes<ContentTypesLight, ContentTypesDark>;
type ElevationTypes = MergeTypes<ElevationTypesLight, ElevationTypesDark>;
type CalendarTypes = MergeTypes<CalendarTypesLight, CalendarTypesDark>;
type InteractionTypes = MergeTypes<InteractionTypesLight, InteractionTypesDark>;
type RadioButtonTypes = MergeTypes<RadioButtonTypesLight, RadioButtonTypesDark>;
type SideNavigationTypes = MergeTypes<
  SideNavigationTypesLight,
  SideNavigationTypesDark
>;
type DropdownTypes = MergeTypes<DropdownTypesLight, DropdownTypesDark>;
type TableTypes = MergeTypes<TableTypesLight, TableTypesDark>;
type TextFieldTypes = MergeTypes<TextFieldTypesLight, TextFieldTypesDark>;
type Fonts = {
  bold: TypographyTypes['Body']['Bold'];
  extrabold: TypographyTypes['Body']['Extrabold'];
  italic: TypographyTypes['Body']['Italic'];
  list: TypographyTypes['Body']['List'];
  normal: TypographyTypes['Body']['Regular'];
  semibold: TypographyTypes['Body']['Semibold'];
};

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
      // ----------------------------------------
      accent: AccentTypes;
      action: ActionTypes;
      background: BackgroundTypes;
      //  ---- Global tokens: theme agnostic ----
      border: BorderTypes;
      borderRadius: BorderRadiusTypes;
      calendar: CalendarTypes;
      chart: ChartTypes;
      color: ColorTypes;
      content: ContentTypes;
      dropdown: DropdownTypes;
      elevation: ElevationTypes;
      font: FontTypes;
      footer: FooterTypes;
      header: GlobalHeaderTypes;
      interaction: InteractionTypes;
      radio: RadioButtonTypes;
      radius: RadiusTypes;
      search: SearchTypes;
      sideNavigation: SideNavigationTypes;
      spacing: SpacingTypes;
      table: TableTypes;
      textField: TextFieldTypes;
      typography: TypographyTypes;
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
      // ----------------------------------------
      accent?: AccentTypes;
      action?: ActionTypes;
      background?: BackgroundTypes;
      border?: BorderTypes;
      //  ---- Global tokens: theme agnostic ----
      borderRadius?: BorderRadiusTypes;
      calendar?: CalendarTypes;
      chart?: ChartTypes;
      color?: ColorTypes;
      content?: ContentTypes;
      dropdown?: DropdownTypes;
      elevation?: ElevationTypes;
      font?: FontTypes;
      footer?: FooterTypes;
      header?: GlobalHeaderTypes;
      interaction?: InteractionTypes;
      radio?: RadioButtonTypes;
      radius?: RadiusTypes;
      search?: SearchTypes;
      sideNavigation?: SideNavigationTypes;
      spacing?: SpacingTypes;
      table?: TableTypes;
      textField?: TextFieldTypes;
      typography?: TypographyTypes;
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
