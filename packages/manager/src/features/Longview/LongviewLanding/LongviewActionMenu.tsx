import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';

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

type CombinedProps = Props;

const LongviewActionMenu: React.FC<CombinedProps> = (props) => {
  const {
    longviewClientID,
    longviewClientLabel,
    triggerDeleteLongviewClient,
    userCanModifyClient,
  } = props;

  const actions: Action[] = [
    {
      title: 'Delete',
      disabled: !userCanModifyClient,
      tooltip: userCanModifyClient
        ? ''
        : 'Contact an account administrator for permission.',
      onClick: () => {
        triggerDeleteLongviewClient(longviewClientID, longviewClientLabel);
      },
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Longview Client ${props.longviewClientLabel}`}
    />
  );
};

export default React.memo(LongviewActionMenu);
