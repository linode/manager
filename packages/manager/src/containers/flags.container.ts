import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { FlagSet } from 'src/featureFlags';

export interface WithFeatureFlagProps {
  flags: FlagSet;
}

interface ComponentProps<P> extends WithFeatureFlagProps {
  componentProps: P;
}

export const withFeatureFlags = <P extends {}>(
  Component: React.ComponentType<ComponentProps<P>>
) => {
  return (props: P) => {
    const flags = useFlags();

    return React.createElement(Component, {
      componentProps: props,
      flags,
    });
  };
};
