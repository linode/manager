import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Subnet } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface SubnetActionHandlers {
  handleAssignLinodes: (subnet: Subnet) => void;
  handleDelete: (subnet: Subnet) => void;
  handleEdit: (subnet: Subnet) => void;
  handleUnassignLinodes: (subnet: Subnet) => void;
}

interface Props extends SubnetActionHandlers {
  numUniqueResources: number;
  subnet: Subnet;
  vpcId: number;
}

export const SubnetActionMenu = (props: Props) => {
  const {
    handleAssignLinodes,
    handleDelete,
    handleEdit,
    handleUnassignLinodes,
    numUniqueResources,
    subnet,
    vpcId,
  } = props;

  const { data: permissions } = usePermissions(
    'vpc',
    ['update_vpc', 'delete_vpc'],
    vpcId
  );

  const canUpdateVPC = permissions?.update_vpc;
  const canDeleteVPC = permissions?.delete_vpc;

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
      // TODO: change to 'update_vpc_subnet' once it's available
      disabled: !canUpdateVPC,
      tooltip: !canUpdateVPC
        ? 'You do not have permission to edit this subnet.'
        : undefined,
    },
    {
      // TODO: change to 'delete_vpc_subnet' once it's available
      disabled: numUniqueResources !== 0 || !canDeleteVPC,
      onClick: () => {
        handleDelete(subnet);
      },
      title: 'Delete',
      tooltip:
        numUniqueResources > 0
          ? 'Resources assigned to a subnet must be unassigned before the subnet can be deleted.'
          : !canDeleteVPC
            ? 'You do not have permission to delete this subnet.'
            : undefined,
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
