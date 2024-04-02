import { create } from '@storybook/theming';
import { addons } from '@storybook/manager-api';
import Logo from '../src/assets/logo/akamai-logo-color.svg';

const theme = create({
  base: 'light',
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
  brandImage: Logo,
});

addons.setConfig({
  theme,
});
