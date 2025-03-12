import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Subnet } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface SubnetActionHandlers {
  handleAssignLinodes: (subnet: Subnet) => void;
  handleDelete: (subnet: Subnet) => void;
  handleEdit: (subnet: Subnet) => void;
  handleUnassignLinodes: (subnet: Subnet) => void;
}

interface Props extends SubnetActionHandlers {
  isVPCLKEEnterpriseCluster: boolean;
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
    isVPCLKEEnterpriseCluster,
    numLinodes,
    subnet,
  } = props;

  const actions: Action[] = [
    {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handleAssignLinodes(subnet);
      },
      title: 'Assign Linodes',
    },
    {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handleUnassignLinodes(subnet);
      },
      title: 'Unassign Linodes',
    },
    {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handleEdit(subnet);
      },
      title: 'Edit',
    },
    {
      disabled: numLinodes !== 0 || isVPCLKEEnterpriseCluster,
      onClick: () => {
        handleDelete(subnet);
      },
      title: 'Delete',
      tooltip:
        !isVPCLKEEnterpriseCluster && numLinodes > 0
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
