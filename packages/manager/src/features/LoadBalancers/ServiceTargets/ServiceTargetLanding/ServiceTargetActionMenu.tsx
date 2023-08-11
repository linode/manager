import * as React from 'react';
import { ActionMenu, Action } from 'src/components/ActionMenu';

interface Props {
  label: string;
  toggleDialog: (serviceTargetId: number, label: string) => void;
}

// TODO: AGLB - Needs UX clarification: available actions?
export const ServiceTargetActionMenu = (props: Props) => {
  const { label } = props;

  const actions: Action[] = [
    {
      title: 'TODO',
      onClick: () => {
        return;
      },
    },
    {
      title: 'TODO',
      onClick: () => {
        return;
      },
    },
    {
      title: 'TODO',
      onClick: () => {
        return;
      },
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Service Target ${label}`}
    />
  );
};
