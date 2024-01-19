import React from 'react';

import { useEventsPollingActions } from 'src/queries/events/events';

export type WithEventsPollingActionProps = ReturnType<
  typeof useEventsPollingActions
>;

export const withEventsPollingActions = <Props>(
  Component: React.ComponentType<Props & WithEventsPollingActionProps>
) => {
  return (props: Props) => {
    const polling = useEventsPollingActions();

    return React.createElement(Component, {
      ...props,
      ...polling,
    });
  };
};
