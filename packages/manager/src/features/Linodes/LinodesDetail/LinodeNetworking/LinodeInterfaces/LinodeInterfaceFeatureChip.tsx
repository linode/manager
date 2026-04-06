import { BetaChip, NewFeatureChip } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { BetaChipProps } from '@linode/ui';

interface Props extends BetaChipProps {
  /**
   * If provided, this will be what is rendered when no chip is showing.
   *
   * @default null
   */
  fallback?: React.ReactNode;
}

/**
 * Renders a Chip informing users of the status of the Linode Interfaces feature.
 */
export const LinodeInterfaceFeatureStatusChip = (props: Props) => {
  const { fallback, ...chipProps } = props;

  const flags = useFlags();

  if (flags.linodeInterfaces?.beta) {
    return <BetaChip {...chipProps} />;
  }

  if (flags.linodeInterfaces?.new) {
    return <NewFeatureChip {...chipProps} />;
  }

  if (fallback) {
    return fallback;
  }

  return null;
};
