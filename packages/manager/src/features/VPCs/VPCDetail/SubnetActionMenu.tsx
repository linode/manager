import { Subnet } from '@linode/api-v4';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';

interface SubnetActionHandlers {
  handleAssignLinodes: (subnet: Subnet) => void;
  handleDelete: (subnet: Subnet) => void;
  handleEdit: (subnet: Subnet) => void;
  handleUnassignLinodes: (subnet: Subnet) => void;
}

interface Props extends SubnetActionHandlers {
  numLinodes: number;
  subnet: Subnet;
  vpcId: number;
}

export const SubnetActionMenu = (props: Props) => {
  const {
    handleAssignLinodes,
    handleDelete,
    handleEdit,
    handleUnassignLinodes,
    numLinodes,
    subnet,
  } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        handleAssignLinodes(subnet);
      },
      title: 'Assign Linodes',
    },
    {
      onClick: () => {
        handleUnassignLinodes(subnet);
      },
      title: 'Unassign Linodes',
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
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Subnet ${subnet.label}`}
    />
  );
};

export default SubnetActionMenu;
