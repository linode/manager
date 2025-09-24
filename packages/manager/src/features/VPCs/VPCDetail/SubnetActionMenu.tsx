import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsNodebalancerVPCEnabled } from 'src/features/NodeBalancers/utils';

import type { Subnet } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface SubnetActionHandlers {
  handleAssignLinodes: (subnet: Subnet) => void;
  handleDelete: (subnet: Subnet) => void;
  handleEdit: (subnet: Subnet) => void;
  handleUnassignLinodes: (subnet: Subnet) => void;
}

interface Props extends SubnetActionHandlers {
  numLinodes: number;
  numNodebalancers: number;
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
    numNodebalancers,
    subnet,
    vpcId,
  } = props;

  const flags = useIsNodebalancerVPCEnabled();

  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpcId);
  const canUpdateVPC = permissions?.update_vpc;

  const actions: Action[] = [
    {
      onClick: () => {
        handleAssignLinodes(subnet);
      },
      title: 'Assign Linodes',
      disabled: !canUpdateVPC,
      tooltip: !canUpdateVPC
        ? 'You do not have permission to assign Linode to this subnet.'
        : undefined,
    },
    {
      onClick: () => {
        handleUnassignLinodes(subnet);
      },
      title: 'Unassign Linodes',
      disabled: !canUpdateVPC,
      tooltip: !canUpdateVPC
        ? 'You do not have permission to unassign Linode from this subnet.'
        : undefined,
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
      disabled: numLinodes !== 0 || numNodebalancers !== 0 || !canUpdateVPC,
      onClick: () => {
        handleDelete(subnet);
      },
      title: 'Delete',
      tooltip:
        numLinodes > 0 || numNodebalancers > 0
          ? `${flags.isNodebalancerVPCEnabled ? 'Resources' : 'Linodes'} assigned to a subnet must be unassigned before the subnet can be deleted.`
          : !canUpdateVPC
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
