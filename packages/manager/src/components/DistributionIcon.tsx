import 'font-logos/assets/font-logos.css';
import React from 'react';

import { Box } from './Box';

import type { BoxProps } from './Box';
import type { Image } from '@linode/api-v4';

interface Props extends BoxProps {
  /**
   * The Linux distribution name
   */
  distribution: Image['vendor'];
}

/**
 * Linux distribution icon component
 *
 * Uses https://github.com/Lukas-W/font-logos
 */
export const DistributionIcon = (props: Props) => {
  const { distribution, ...rest } = props;

  const className = distribution
    ? `fl-${distroIcons[distribution] ?? 'tux'}`
    : `fl-tux`;

  return <Box className={className} data-testid="distro-icon" {...rest} />;
};

/**
 * Maps an Image's `vendor` field to a font-logos className
 *
 * @see https://github.com/Lukas-W/font-logos
 */
export const distroIcons = {
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
