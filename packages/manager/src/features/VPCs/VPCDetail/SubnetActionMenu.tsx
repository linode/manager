/* eslint-disable @typescript-eslint/no-empty-function */
import { Subnet } from '@linode/api-v4';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

interface SubnetsActionHandlers {
  handleDelete: (subnet: Subnet) => void;
  handleEdit: (subnet: Subnet) => void;
}

interface Props extends SubnetsActionHandlers {
  numLinodes: number;
  subnet: Subnet;
  vpcId: number;
}

export const SubnetActionMenu = (props: Props) => {
  const { handleDelete, handleEdit, numLinodes, subnet } = props;

  const handleAssignLinode = () => {};

  const handleUnassignLinode = () => {};

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
        handleEdit(subnet);
      },
      title: 'Edit',
    },
    {
      disabled: numLinodes !== 0,
      onClick: () => {
        handleDelete(subnet);
      },
      title: 'Delete',
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
