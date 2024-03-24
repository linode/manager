import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { FlagSet } from 'src/featureFlags';

export interface WithFeatureFlagProps {
  flags: FlagSet;
}

export const withFeatureFlags = <P extends {}>(
  Component: React.ComponentType<WithFeatureFlagProps>
) => {
  return (props: P) => {
    const flags = useFlags();

    return React.createElement(Component, {
      ...props,
      flags,
    });
  };
};
