import { APIError, Firewall, Linode } from '@linode/api-v4';
import { Config, Interface } from '@linode/api-v4/lib/linodes/types';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import {
  queryKey as linodesQueryKey,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import {
  NETWORK_INTERFACES_GUIDE_URL,
  VPC_REBOOT_MESSAGE,
  WARNING_ICON_UNRECOMMENDED_CONFIG,
} from '../constants';
import {
  hasUnrecommendedConfiguration as _hasUnrecommendedConfiguration,
  getSubnetInterfaceFromConfigs,
} from '../utils';
import {
  StyledActionTableCell,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableRow,
  StyledWarningIcon,
} from './SubnetLinodeRow.styles';

import type { Subnet } from '@linode/api-v4/lib/vpcs/types';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface Props {
  handlePowerActionsLinode: (linode: Linode, action: Action) => void;
  handleUnassignLinode: (linode: Linode, subnet?: Subnet) => void;
  linodeId: number;
  subnet?: Subnet;
  subnetId: number;
}

export const SubnetLinodeRow = (props: Props) => {
  const queryClient = useQueryClient();
  const {
    handlePowerActionsLinode,
    handleUnassignLinode,
    linodeId,
    subnet,
    subnetId,
  } = props;

  const {
    data: linode,
    error: linodeError,
    isLoading: linodeLoading,
  } = useLinodeQuery(linodeId);

  const {
    data: attachedFirewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useLinodeFirewallsQuery(linodeId);

  const {
    data: configs,
    error: configsError,
    isLoading: configsLoading,
  } = useAllLinodeConfigsQuery(linodeId);

  const hasUnrecommendedConfiguration = _hasUnrecommendedConfiguration(
    configs ?? []
  );

  // If the Linode's status is running, we want to check if its interfaces associated with this subnet have become active so
  // that we can determine if it needs a reboot or not. So, we need to invalidate the linode configs query to get the most up to date information.
  React.useEffect(() => {
    if (linode && linode.status === 'running') {
      queryClient.invalidateQueries([
        linodesQueryKey,
        'linode',
        linodeId,
        'configs',
      ]);
    }
  }, [linode, linodeId, queryClient]);

  if (linodeLoading || !linode) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
          <CircleProgress mini />
        </TableCell>
      </TableRow>
    );
  }

  if (linodeError) {
    return (
      <TableRow data-testid="subnet-linode-row-error">
        <TableCell colSpan={5} style={{ paddingLeft: 24 }}>
          <Box alignItems="center" display="flex">
            <ErrorOutline
              data-qa-error-icon
              sx={(theme) => ({ color: theme.color.red, marginRight: 1 })}
            />
            <Typography>
              There was an error loading{' '}
              <Link to={`/linodes/${linodeId}`}>Linode {linodeId}</Link>
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  const linkifiedLinodeLabel = (
    <Link to={`/linodes/${linode.id}`}>{linode.label}</Link>
  );

  const labelCell = hasUnrecommendedConfiguration ? (
    <Box
      data-testid={WARNING_ICON_UNRECOMMENDED_CONFIG}
      sx={{ alignItems: 'center', display: 'flex' }}
    >
      <TooltipIcon
        text={
          <Typography>
            This Linode is using an unrecommended configuration profile. Update
            its configuration profile to avoid connectivity issues. Read our{' '}
            <Link to={NETWORK_INTERFACES_GUIDE_URL}>
              Configuration Profiles
            </Link>{' '}
            guide for more information.
          </Typography>
        }
        icon={<StyledWarningIcon />}
        interactive
        status="other"
        sxTooltipIcon={{ paddingLeft: 0 }}
      />
      {linkifiedLinodeLabel}
    </Box>
  ) : (
    linkifiedLinodeLabel
  );

  const iconStatus = getLinodeIconStatus(linode.status);
  const isRunning = linode.status === 'running';
  const isOffline = linode.status === 'stopped' || linode.status === 'offline';
  const isRebootNeeded =
    isRunning &&
    configs?.some((config) =>
      config.interfaces.some(
        (linodeInterface) =>
          linodeInterface.purpose === 'vpc' && !linodeInterface.active
      )
    );

  const showPowerButton = !isRebootNeeded && (isRunning || isOffline);

  return (
    <StyledTableRow>
      <StyledTableCell component="th" scope="row" sx={{ paddingLeft: 6 }}>
        {labelCell}
      </StyledTableCell>
      <StyledTableCell statusCell>
        <StatusIcon
          aria-label={`Linode status ${linode?.status ?? iconStatus}`}
          status={iconStatus}
        />
        {isRebootNeeded ? (
          <>
            {'Reboot Needed'}
            <TooltipIcon
              status="help"
              sxTooltipIcon={{ paddingRight: 0 }}
              text={VPC_REBOOT_MESSAGE}
            />
          </>
        ) : (
          capitalizeAllWords(linode.status.replace('_', ' '))
        )}
      </StyledTableCell>
      <Hidden smDown>
        <StyledTableCell>
          {getSubnetLinodeIPv4CellString(
            configs ?? [],
            configsLoading,
            subnetId,
            configsError ?? undefined
          )}
        </StyledTableCell>
      </Hidden>
      <Hidden smDown>
        <StyledTableCell>
          {getFirewallsCellString(
            attachedFirewalls?.data ?? [],
            firewallsLoading,
            firewallsError ?? undefined
          )}
        </StyledTableCell>
      </Hidden>
      <StyledActionTableCell actionCell>
        {isRebootNeeded && (
          <InlineMenuAction
            onClick={() => {
              handlePowerActionsLinode(linode, 'Reboot');
            }}
            actionText="Reboot"
          />
        )}
        {showPowerButton && (
          <InlineMenuAction
            onClick={() => {
              handlePowerActionsLinode(
                linode,
                isOffline ? 'Power On' : 'Power Off'
              );
            }}
            actionText={isOffline ? 'Power On' : 'Power Off'}
          />
        )}
        <InlineMenuAction
          actionText="Unassign Linode"
          onClick={() => handleUnassignLinode(linode, subnet)}
        />
      </StyledActionTableCell>
    </StyledTableRow>
  );
};

const getFirewallsCellString = (
  data: Firewall[],
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Firewalls';
  }

  if (data.length === 0) {
    return 'None';
  }

  return getFirewallLinks(data);
};

const getSubnetLinodeIPv4CellString = (
  configs: Config[],
  loading: boolean,
  subnetId: number,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving VPC IPv4s';
  }

  if (configs.length === 0) {
    return 'None';
  }

  const configInterface = getSubnetInterfaceFromConfigs(configs, subnetId);
  return getIPv4Link(configInterface);
};

const getIPv4Link = (configInterface: Interface | undefined): JSX.Element => {
  return (
    <>
      {configInterface && (
        <span key={configInterface.id}>{configInterface.ipv4?.vpc}</span>
      )}
    </>
  );
};

const getFirewallLinks = (data: Firewall[]): JSX.Element => {
  const firstThreeFirewalls = data.slice(0, 3);
  return (
    <>
      {firstThreeFirewalls.map((firewall, idx) => (
        <Link
          className="link secondaryLink"
          data-testid="firewall-row-link"
          key={firewall.id}
          to={`/firewalls/${firewall.id}`}
        >
          {idx > 0 && `, `}
          {firewall.label}
        </Link>
      ))}
      {data.length > 3 && (
        <span>
          {`, `}plus {data.length - 3} more.
        </span>
      )}
    </>
  );
};

export const SubnetLinodeTableRowHead = (
  <TableRow>
    <StyledTableHeadCell>Linode Label</StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '14%' }}>Status</StyledTableHeadCell>
    <Hidden smDown>
      <StyledTableHeadCell>VPC IPv4</StyledTableHeadCell>
    </Hidden>
    <Hidden smDown>
      <StyledTableHeadCell>Firewalls</StyledTableHeadCell>
    </Hidden>
    <StyledTableHeadCell />
  </TableRow>
);
