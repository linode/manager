import { SvgIcon, useTheme } from '@linode/ui';
import React from 'react';

import LightThemeAkamaiLogo from 'src/assets/logo/akamai-logo-navy-text.svg';
import DarkThemeAkamaiLogo from 'src/assets/logo/akamai-logo-white-text.svg';

import type { SvgIconProps } from '@linode/ui';

const LOGO_MAP = {
  light: LightThemeAkamaiLogo,
  dark: DarkThemeAkamaiLogo,
};

export const ThemeAwareLogo = (props: SvgIconProps) => {
  const theme = useTheme();

  return <SvgIcon component={LOGO_MAP[theme.name]} inheritViewBox {...props} />;
};
