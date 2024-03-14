import 'font-logos/assets/font-logos.css';
import React from 'react';

import type { Image } from '@linode/api-v4';

interface Props {
  /**
   * The Linux distribution name
   */
  distribution: Image['vendor'];
  /**
   * An optional size for the icon
   * @default '1.8em'
   */
  size?: React.CSSProperties['fontSize'];
}

/**
 * Linux distribution icon component
 *
 * Uses https://github.com/Lukas-W/font-logos
 */
export const DistributionIcon = (props: Props) => {
  const { distribution, size } = props;

  const className = distribution
    ? `fl-${distroIcons[distribution] ?? 'tux'}`
    : `fl-tux`;

  return (
    <i
      className={className}
      data-testid="distro-icon"
      style={{ fontSize: size ?? '1.8em' }}
    />
  );
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
