import { create } from '@storybook/theming';
import { addons } from '@storybook/addons';
import Logo from '../src/assets/logo/akamai-logo.svg';

const theme = create({
  base: 'light',
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
  brandImage: Logo,
});

addons.setConfig({
  theme,
});
