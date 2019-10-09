import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  triggerEditLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

interface Props extends ActionHandlers {
  longviewClientID: number;
  longviewClientLabel: string;
}

type CombinedProps = Props;

const LongviewActionMenu: React.FC<CombinedProps> = props => {
  const {
    longviewClientID,
    longviewClientLabel,
    triggerDeleteLongviewClient,
    triggerEditLongviewClient
  } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => [
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          triggerEditLongviewClient(longviewClientID, longviewClientLabel);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          closeMenu();
          triggerDeleteLongviewClient(longviewClientID, longviewClientLabel);
        }
      }
    ];
  };

  return <ActionMenu createActions={createActions()} />;
};

export default React.memo(LongviewActionMenu);
