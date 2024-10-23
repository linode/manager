import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT } from 'src/features/Linodes/PublicIPAddressesTooltip';

import type { IPTypes } from './types';
import type { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  ipAddress?: IPAddress | IPRange;
  ipType: IPTypes;
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
    isVPCOnlyLinode,
    onEdit,
    onRemove,
    readOnly,
  } = props;

  const showEdit = ![
    'IPv4 – Private',
    'IPv4 – Reserved (private)',
    'IPv4 – Reserved (public)',
    'IPv4 – VPC',
    'IPv6 – Link Local',
    'VPC IPv4 – NAT',
  ].includes(ipType);

  const deletableIPTypes = ['IPv4 – Public', 'IPv4 – Private', 'IPv6 – Range'];

  // if we have a 116 we don't want to give the option to remove it
  const is116Range = ipAddress?.prefix === 116;

  const readOnlyTooltip = readOnly
    ? "You don't have permissions to perform this action"
    : undefined;

  const isOnlyPublicIPTooltip = isOnlyPublicIP
    ? 'Linodes must have at least one public IP'
    : undefined;

  const actions = [
    onRemove && ipAddress && !is116Range && deletableIPTypes.includes(ipType)
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
            ? PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT
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
            ? PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT
            : undefined,
        }
      : null,
  ].filter(Boolean) as Action[];

  return !isEmpty(actions) ? (
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
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for IP Address ${props.ipAddress}`}
        />
      )}
    </>
  ) : (
    <Box sx={{ height: 40 }}></Box>
  );
};
