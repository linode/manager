/* eslint-disable @typescript-eslint/no-empty-function */
import { Subnet } from '@linode/api-v4';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

interface SubnetsActionHandlers {
  handleDelete: (subnet: Subnet) => void;
}

interface Props extends SubnetsActionHandlers {
  numLinodes: number;
  subnet: Subnet;
  vpcId: number;
}

export const SubnetActionMenu = (props: Props) => {
  const { handleDelete, numLinodes, subnet } = props;

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
        handleDelete(subnet);
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
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Subnet ${subnet.label}`}
    />
  );
};

export default SubnetActionMenu;
