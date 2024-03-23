import React from 'react';

import { useEventsPollingActions } from 'src/queries/events/events';

export type WithEventsPollingActionProps = ReturnType<
  typeof useEventsPollingActions
>;

interface ComponentProps<P> extends WithEventsPollingActionProps {
  componentProps: P;
}

export const withEventsPollingActions = <P extends {}>(
  Component: React.ComponentType<ComponentProps<P>>
) => {
  return (props: P) => {
    const polling = useEventsPollingActions();

    return React.createElement(Component, {
      componentProps: props,
      ...polling,
    });
  };
};
