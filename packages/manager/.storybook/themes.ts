import { create, ThemeVarsColors } from 'storybook/theming';

const baseTheme: Partial<ThemeVarsColors> = {
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
  brandImage:
    'https://raw.githubusercontent.com/linode/manager/refs/heads/develop/packages/manager/src/assets/logo/akamai-logo-color.svg',
};

export const themes = {
  light: create({
    base: 'light',
    ...baseTheme,
  }),
  dark: create({
    base: 'dark',
    ...baseTheme,
  }),
};
