import { BetaChip, NewFeatureChip } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { BetaChipProps } from '@linode/ui';

interface Props extends BetaChipProps {
  fallback?: React.ReactNode;
}

export const LinodeInterfaceFeatureChip = ({ fallback, ...props }: Props) => {
  const flags = useFlags();

  if (flags.linodeInterfaces?.beta) {
    return <BetaChip {...props} />;
  }

  if (flags.linodeInterfaces?.new) {
    return <NewFeatureChip {...props} />;
  }

  if (fallback) {
    return fallback;
  }

  return null;
};
