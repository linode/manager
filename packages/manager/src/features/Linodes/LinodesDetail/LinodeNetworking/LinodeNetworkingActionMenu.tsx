import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import {
  PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT,
  PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_TOOLTIP_TEXT,
} from 'src/features/Linodes/PublicIPAddressesTooltip';

import type { IPTypes } from './types';
import type { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  ipAddress: IPAddress | IPRange;
  ipType: IPTypes;
  isLinodeInterface: boolean;
  isOnlyPublicIP: boolean;
  isVPCOnlyLinode: boolean;
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  readOnly: boolean;
}

export const LinodeNetworkingActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));
  const {
    ipAddress,
    ipType,
    isOnlyPublicIP,
    isLinodeInterface,
    isVPCOnlyLinode,
    onEdit,
    onRemove,
    readOnly,
  } = props;

  const showEdit = ![
    'Link Local – IPv6',
    'Private – IPv4',
    'Reserved IPv4 (private)',
    'Reserved IPv4 (public)',
    'VPC – IPv4',
    'VPC NAT – IPv4',
  ].includes(ipType);

  const deletableIPTypes = ['Private – IPv4', 'Public – IPv4', 'Range – IPv6'];

  // if we have a 116 we don't want to give the option to remove it
  const is116Range = ipAddress?.prefix === 116;

  const readOnlyTooltip = readOnly
    ? "You don't have permissions to perform this action"
    : undefined;

  const isOnlyPublicIPTooltip = isOnlyPublicIP
    ? 'Linodes must have at least one public IP'
    : undefined;

  const isPublicIPNotAssignedCopy = isLinodeInterface
    ? PUBLIC_IP_ADDRESSES_LINODE_INTERFACE_TOOLTIP_TEXT
    : PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT;

  const isAssociatedWithLinodeInterface =
    'address' in ipAddress && ipAddress.interface_id !== null;

  const getAriaLabel = (): string => {
    if ('address' in ipAddress) {
      return `Action menu for IP Address ${ipAddress.address}`;
    } else {
      return `Action menu for IP Address ${ipAddress.range}`;
    }
  };

  const actions = [
    onRemove &&
    ipAddress &&
    !is116Range &&
    deletableIPTypes.includes(ipType) &&
    !isAssociatedWithLinodeInterface
      ? {
          disabled: readOnly || isOnlyPublicIP || isVPCOnlyLinode,
          id: 'delete',
          onClick: () => {
            onRemove(ipAddress);
          },
          title: 'Delete',
          tooltip: readOnly
            ? readOnlyTooltip
            : isVPCOnlyLinode
              ? isPublicIPNotAssignedCopy
              : isOnlyPublicIP
                ? isOnlyPublicIPTooltip
                : undefined,
        }
      : null,
    onEdit && ipAddress && showEdit
      ? {
          disabled: readOnly || isVPCOnlyLinode,
          id: 'edit-rdns',
          onClick: () => {
            onEdit(ipAddress);
          },
          title: 'Edit RDNS',
          tooltip: readOnly
            ? readOnlyTooltip
            : isVPCOnlyLinode
              ? isPublicIPNotAssignedCopy
              : undefined,
        }
      : null,
  ].filter(Boolean) as Action[];

  return actions.length > 0 ? (
    <>
      {!matchesMdDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              data-testid={`action-menu-item-${action.id}`}
              disabled={action.disabled}
              key={action.id}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      {matchesMdDown && (
        <ActionMenu actionsList={actions} ariaLabel={getAriaLabel()} />
      )}
    </>
  ) : (
    <Box sx={{ height: 40 }} />
  );
};
