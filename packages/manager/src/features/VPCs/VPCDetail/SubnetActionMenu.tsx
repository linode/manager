/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

export interface SubnetActionHandlers {
  handleDelete: (subnetId: number, subnetLabel: string) => void;
}

interface Props extends SubnetActionHandlers {
  numLinodes: number;
  subnetId: number;
  subnetLabel: string;
  vpcId: number;
}

export const SubnetsActionMenu = (props: Props) => {
  const { numLinodes, subnetId, subnetLabel } = props;

  const handleAssignLinode = () => {};

  const handleUnassignLinode = () => {};

  const handleEdit = () => {};

  const handleDelete = () => {
    const { handleDelete } = props;
    handleDelete(subnetId, subnetLabel);
  };

  const actions: Action[] = [
    {
      onClick: () => {
        handleAssignLinode();
      },
      title: 'Assign Linode',
    },
    {
      onClick: () => {
        handleUnassignLinode();
      },
      title: 'Unassign Linode',
    },
    {
      onClick: () => {
        handleEdit();
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        handleDelete();
      },
      title: 'Delete',
      disabled: numLinodes !== 0,
      tooltip:
        numLinodes > 0
          ? 'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
          : '',
    },
  ];

  return (
    <ActionMenu actionsList={actions} ariaLabel={`Action menu for Subnet`} />
  );
};

export default SubnetsActionMenu;
