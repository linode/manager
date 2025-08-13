/// <reference types="vite/client" />

import { create, ThemeVarsColors } from 'storybook/theming';
import LightThemeAkamaiLogo from '../src/assets/logo/akamai-logo-navy-text.svg?url';
import DarkThemeAkamaiLogo from '../src/assets/logo/akamai-logo-white-text.svg?url';

const baseTheme: Partial<ThemeVarsColors> = {
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
};

export const themes = {
  light: create({
    base: 'light',
    brandImage: LightThemeAkamaiLogo,
    ...baseTheme,
  }),
  dark: create({
    base: 'dark',
    brandImage: DarkThemeAkamaiLogo,
    ...baseTheme,
  }),
};
