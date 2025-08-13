import { create, ThemeVarsColors } from 'storybook/theming';

const baseTheme: Partial<ThemeVarsColors> = {
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
};

export const themes = {
  light: create({
    base: 'light',
    brandImage:
      'https://raw.githubusercontent.com/linode/manager/refs/heads/develop/packages/manager/src/assets/logo/akamai-logo-navy-text.svg',
    ...baseTheme,
  }),
  dark: create({
    base: 'dark',
    brandImage:
      'https://raw.githubusercontent.com/linode/manager/refs/heads/develop/packages/manager/src/assets/logo/akamai-logo-white-text.svg',
    ...baseTheme,
  }),
};
