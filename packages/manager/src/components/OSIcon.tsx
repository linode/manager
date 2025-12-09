import { Box } from '@linode/ui';
import 'font-logos/assets/font-logos.css';
import React from 'react';

import type { Image } from '@linode/api-v4';
import type { BoxProps } from '@linode/ui';

interface Props extends BoxProps {
  /**
   * The Linux operating system name
   */
  os: Image['vendor'];
}

/**
 * Linux OS icon component
 *
 * Uses https://github.com/Lukas-W/font-logos
 */
export const OSIcon = (props: Props) => {
  const { os, ...rest } = props;

  const className = os
    ? `fl-${OS_ICONS[os as keyof typeof OS_ICONS] ?? 'tux'}`
    : `fl-tux`;

  return <Box className={className} data-testid="os-icon" {...rest} />;
};

/**
 * Maps an Image's `vendor` field to a font-logos className
 *
 * @see https://github.com/Lukas-W/font-logos
 */
export const OS_ICONS = {
  AlmaLinux: 'almalinux',
  Alpine: 'alpine',
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  Kali: 'kali-linux',
  Rocky: 'rocky-linux',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu',
  openSUSE: 'opensuse',
};
