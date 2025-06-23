import { create } from 'storybook/theming';
import { addons } from 'storybook/manager-api';

const theme = create({
  base: 'light',
  brandTitle: 'Akamai',
  brandUrl: 'https://www.linode.com',
  brandImage: "https://raw.githubusercontent.com/linode/manager/refs/heads/develop/packages/manager/src/assets/logo/akamai-logo-color.svg",
});

addons.setConfig({
  theme,
});
