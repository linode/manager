import React from 'react';

import { distroIcons } from './icons';

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

  return (
    <i
      className={
        distribution ? `fl-${distroIcons[distribution] ?? 'tux'}` : `fl-tux`
      }
      data-testid="distro-icon"
      style={{ fontSize: size ?? '1.8em' }}
    />
  );
};
