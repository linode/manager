import React from 'react';

import { distroIcons } from './icons';

import type { Image } from '@linode/api-v4';

interface Props {
  distribution: Image['vendor'];
  size?: React.CSSProperties['fontSize'];
}

export const DistributionIcon = (props: Props) => {
  const { distribution, size } = props;

  return (
    <i
      className={
        distribution ? `fl-${distroIcons[distribution] ?? 'tux'}` : `fl-tux`
      }
      style={{ fontSize: size ?? '1.8em' }}
    />
  );
};
