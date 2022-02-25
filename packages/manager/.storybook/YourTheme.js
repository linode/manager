// .storybook/YourTheme.js
import { create } from '@storybook/theming';
import Logo from '../src/assets/logo/logo.svg';

const brand = {
  blue: '#3683dc',
  grey1: '#888f91',
  grey2: '#3a3f46',
  black: '#32363c',
  white: '#fff',
};

export default create({
  base: 'light',

  brandTitle: 'Linode',
  brandUrl: 'https://www.linode.com',
  brandImage: Logo,

  colorPrimary: brand.blue,
  colorSecondary: '#2575d0',

  // UI
  appBg: brand.grey2,

  // Typography
  fontBase: '"LatoWeb", sans-serif',

  // Text colors
  textColor: brand.black,

  // Toolbar default and active colors
  barTextColor: brand.grey1,
  barSelectedColor: brand.black,
  barBg: brand.white,
});
