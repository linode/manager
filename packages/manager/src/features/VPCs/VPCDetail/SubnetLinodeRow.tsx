import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { determineNoneSingleOrMultipleWithChip } from 'src/utilities/noneSingleOrMultipleWithChip';

import {
  VPC_REBOOT_MESSAGE,
  WARNING_ICON_UNRECOMMENDED_CONFIG,
} from '../constants';
import {
  hasUnrecommendedConfiguration as _hasUnrecommendedConfiguration,
  getSubnetInterfaceFromConfigs,
} from '../utils';
import { StyledWarningIcon } from './SubnetLinodeRow.styles';

import type { APIError, Firewall, Linode } from '@linode/api-v4';
import type { Config, Interface } from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs/types';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface Props {
  handlePowerActionsLinode: (linode: Linode, action: Action) => void;
  handleUnassignLinode: (linode: Linode, subnet?: Subnet) => void;
  hover?: boolean;
  linodeId: number;
  subnet?: Subnet;
  subnetId: number;
}

export const SubnetLinodeRow = (props: Props) => {
  const {
    handlePowerActionsLinode,
    handleUnassignLinode,
    hover = false,
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
    configs ?? [],
    subnet?.id ?? -1
  );

  if (linodeLoading || !linode) {
    return (
      <TableRow hover={hover}>
        <TableCell colSpan={6}>
          <CircleProgress size="sm" />
        </TableCell>
      </TableRow>
    );
  }

  if (linodeError) {
    return (
      <TableRow data-testid="subnet-linode-row-error" hover={hover}>
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
            This Linode is using a configuration profile with a Networking
            setting that is not recommended. To avoid potential connectivity
            issues, edit the Linode’s configuration.
          </Typography>
        }
        icon={<StyledWarningIcon />}
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
      config.interfaces?.some(
        (linodeInterface) =>
          linodeInterface.purpose === 'vpc' && !linodeInterface.active
      )
    );

  const showPowerButton = !isRebootNeeded && (isRunning || isOffline);

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {labelCell}
      </TableCell>
      <TableCell statusCell>
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
      </TableCell>
      <Hidden smDown>
        <TableCell>
          {getSubnetLinodeIPv4CellString(
            configs ?? [],
            configsLoading,
            subnetId,
            configsError ?? undefined
          )}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {getIPRangesCellContents(
            configs ?? [],
            configsLoading,
            subnetId,
            configsError ?? undefined
          )}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {getFirewallsCellString(
            attachedFirewalls?.data ?? [],
            firewallsLoading,
            firewallsError ?? undefined
          )}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
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
      </TableCell>
    </TableRow>
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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {configInterface && (
        <span key={configInterface.id}>{configInterface.ipv4?.vpc}</span>
      )}
    </>
  );
};

const getIPRangesCellContents = (
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
  return determineNoneSingleOrMultipleWithChip(
    configInterface?.ip_ranges ?? []
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
    <TableCell>Linode Label</TableCell>
    <TableCell sx={{ width: '14%' }}>Status</TableCell>
    <Hidden smDown>
      <TableCell>VPC IPv4</TableCell>
    </Hidden>
    <Hidden smDown>
      <TableCell>VPC IPv4 Ranges</TableCell>
    </Hidden>
    <Hidden smDown>
      <TableCell>Firewalls</TableCell>
    </Hidden>
    <TableCell />
  </TableRow>
);
