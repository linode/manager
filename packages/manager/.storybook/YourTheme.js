// .storybook/YourTheme.js
import { create } from '@storybook/theming';
import Logo from '../src/assets/logo/logo.svg';

const brand = {
  blue: '#3683dc',
  lightGrey: '#888f91',
  darkGrey: '#3a3f46',
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
  appBg: brand.darkGrey,

  // Typography
  fontBase: '"LatoWeb", sans-serif',

  // Text colors
  textColor: brand.black,

  // Toolbar default and active colors
  barTextColor: brand.lightGrey,
  barSelectedColor: brand.black,
  barBg: brand.white,
});
