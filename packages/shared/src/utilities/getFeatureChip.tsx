import { BetaChip, NewFeatureChip } from '@linode/ui';
import React from 'react';

export const getFeatureChip = (flag: { beta?: boolean; new?: boolean }) => {
  if (flag.beta) return <BetaChip />;
  if (flag.new) return <NewFeatureChip />;
  return null;
};
