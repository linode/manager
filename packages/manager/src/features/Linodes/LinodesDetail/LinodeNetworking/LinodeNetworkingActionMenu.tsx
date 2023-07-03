import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { IPTypes } from './types';

interface Props {
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  ipType: IPTypes;
  ipAddress?: IPAddress | IPRange;
  readOnly: boolean;
  isOnlyPublicIP: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const LinodeNetworkingActionMenu = (props: CombinedProps) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    onEdit,
    onRemove,
    ipType,
    ipAddress,
    readOnly,
    isOnlyPublicIP,
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
          title: 'Delete',
          onClick: () => {
            onRemove(ipAddress);
          },
          disabled: readOnly || isOnlyPublicIP,
          tooltip: readOnly
            ? readOnlyTooltip
            : isOnlyPublicIP
            ? isOnlyPublicIPTooltip
            : undefined,
        }
      : null,
    onEdit && ipAddress && showEdit
      ? {
          title: 'Edit RDNS',
          onClick: () => {
            onEdit(ipAddress);
          },
          disabled: readOnly,
          tooltip: readOnly ? readOnlyTooltip : undefined,
        }
      : null,
  ].filter(Boolean) as Action[];

  return !isEmpty(actions) ? (
    <>
      {!matchesMdDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              disabled={action.disabled}
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

export default withRouter(LinodeNetworkingActionMenu);
