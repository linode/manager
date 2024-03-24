import React from 'react';

import { useEventsPollingActions } from 'src/queries/events/events';

export type WithEventsPollingActionProps = ReturnType<
  typeof useEventsPollingActions
>;

export const withEventsPollingActions = <P extends {}>(
  Component: React.ComponentType<WithEventsPollingActionProps>
) => {
  return (props: P) => {
    const polling = useEventsPollingActions();

    return React.createElement(Component, {
      ...props,
      ...polling,
    });
  };
};
