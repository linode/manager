import React from 'react';

import { usePollingInterval } from 'src/queries/events';

export type WithPollingIntervalProps = ReturnType<typeof usePollingInterval>;

export const withPollingInterval = <Props>(
  Component: React.ComponentType<Props & WithPollingIntervalProps>
) => {
  return (props: Props) => {
    const polling = usePollingInterval();

    return React.createElement(Component, {
      ...props,
      ...polling,
    });
  };
};
