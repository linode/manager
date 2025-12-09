import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

interface Props extends ActionHandlers {
  longviewClientID: number;
  longviewClientLabel: string;
  userCanModifyClient: boolean;
}

export const LongviewActionMenu = React.memo((props: Props) => {
  const {
    longviewClientID,
    longviewClientLabel,
    triggerDeleteLongviewClient,
    userCanModifyClient,
  } = props;

  const actions: Action[] = [
    {
      disabled: !userCanModifyClient,
      onClick: () => {
        triggerDeleteLongviewClient(longviewClientID, longviewClientLabel);
      },
      title: 'Delete',
      tooltip: userCanModifyClient
        ? ''
        : 'Contact an account administrator for permission.',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Longview Client ${props.longviewClientLabel}`}
    />
  );
});
