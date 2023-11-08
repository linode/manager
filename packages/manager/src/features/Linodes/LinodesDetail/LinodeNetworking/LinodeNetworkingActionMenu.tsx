import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT } from 'src/features/Linodes/AccessTable';

import { IPTypes } from './types';

interface Props {
  disabled: boolean;
  ipAddress?: IPAddress | IPRange;
  ipType: IPTypes;
  isOnlyPublicIP: boolean;
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  readOnly: boolean;
}

export const LinodeNetworkingActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    disabled,
    ipAddress,
    ipType,
    isOnlyPublicIP,
    onEdit,
    onRemove,
    readOnly,
  } = props;

  const showEdit =
    ipType !== 'IPv4 – Private' &&
    ipType !== 'IPv6 – Link Local' &&
    ipType !== 'IPv4 – Reserved (public)' &&
    ipType !== 'IPv4 – Reserved (private)';

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
          disabled: readOnly || isOnlyPublicIP || disabled,
          onClick: () => {
            onRemove(ipAddress);
          },
          title: 'Delete',
          tooltip: readOnly
            ? readOnlyTooltip
            : disabled
            ? PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT
            : isOnlyPublicIP
            ? isOnlyPublicIPTooltip
            : undefined,
        }
      : null,
    onEdit && ipAddress && showEdit
      ? {
          disabled: readOnly || disabled,
          onClick: () => {
            onEdit(ipAddress);
          },
          title: 'Edit RDNS',
          tooltip: readOnly
            ? readOnlyTooltip
            : disabled
            ? PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT
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
              disabled={action.disabled}
              key={action.title}
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
