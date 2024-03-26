import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { FlagSet } from 'src/featureFlags';

export interface WithFeatureFlagProps {
  flags: FlagSet;
}

export const withFeatureFlags = <Props>(
  Component: React.ComponentType<Props & WithFeatureFlagProps>
) => {
  return (props: Props) => {
    const flags = useFlags();

    return React.createElement(Component, {
      ...props,
      flags,
    });
  };
};
