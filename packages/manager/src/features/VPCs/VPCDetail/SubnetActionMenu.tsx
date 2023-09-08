/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

interface SubnetsActionHandlers {
  handleDelete: (subnetId: number, subnetLabel: string) => void;
}

interface Props extends SubnetsActionHandlers {
  numLinodes: number;
  subnetId: number;
  subnetLabel: string;
  vpcId: number;
}

export const SubnetActionMenu = (props: Props) => {
  const { handleDelete, numLinodes, subnetId, subnetLabel } = props;

  const handleAssignLinode = () => {};

  const handleUnassignLinode = () => {};

  const handleEdit = () => {};

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
        handleDelete(subnetId, subnetLabel);
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

export default SubnetActionMenu;
