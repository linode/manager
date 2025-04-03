import {
  useLinodeConfigQuery,
  useLinodeFirewallsQuery,
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
  useLinodeQuery,
} from '@linode/queries';
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
import { determineNoneSingleOrMultipleWithChip } from 'src/utilities/noneSingleOrMultipleWithChip';

import {
  VPC_REBOOT_MESSAGE,
  WARNING_ICON_UNRECOMMENDED_CONFIG,
} from '../constants';
import { hasUnrecommendedConfiguration } from '../utils';
import { StyledWarningIcon } from './SubnetLinodeRow.styles';

import type {
  APIError,
  Firewall,
  Linode,
  LinodeInterface,
  SubnetLinodeInterfaceData,
} from '@linode/api-v4';
import type { Interface } from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs/types';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface Props {
  handlePowerActionsLinode: (linode: Linode, action: Action) => void;
  handleUnassignLinode: (linode: Linode, subnet?: Subnet) => void;
  hover?: boolean;
  isVPCLKEEnterpriseCluster: boolean;
  linodeId: number;
  subnet?: Subnet;
  subnetId: number;
  subnetInterfaces: SubnetLinodeInterfaceData[];
}

export const SubnetLinodeRow = (props: Props) => {
  const {
    handlePowerActionsLinode,
    handleUnassignLinode,
    hover = false,
    isVPCLKEEnterpriseCluster,
    linodeId,
    subnet,
    subnetId,
    subnetInterfaces,
  } = props;

  const subnetInterfaceData =
    subnetInterfaces.find((interfaceData) => interfaceData.active) ??
    subnetInterfaces[0];
  const {
    active: isInterfaceActive,
    config_id: configId,
    id: interfaceId,
  } = subnetInterfaceData;
  const isLinodeInterface = configId === null;

  const {
    data: linode,
    error: linodeError,
    isLoading: linodeLoading,
  } = useLinodeQuery(linodeId);

  const {
    data: attachedFirewallsConfig,
    error: firewallsErrorConfig,
    isLoading: firewallsLoadingConfig,
  } = useLinodeFirewallsQuery(linodeId, !isLinodeInterface);

  const {
    data: attachedFirewallsLinodeInterface,
    error: firewallsErrorLinodeInterface,
    isLoading: firewallsLoadingLinodeInterface,
  } = useLinodeInterfaceFirewallsQuery(
    linodeId,
    interfaceId ?? -1,
    isLinodeInterface
  );

  const attachedFirewalls =
    attachedFirewallsConfig ?? attachedFirewallsLinodeInterface;
  const firewallsError = firewallsErrorConfig ?? firewallsErrorLinodeInterface;
  const firewallsLoading =
    firewallsLoadingConfig || firewallsLoadingLinodeInterface;

  const {
    data: linodeInterface,
    error: linodeInterfaceError,
    isLoading: linodeInterfaceLoading,
  } = useLinodeInterfaceQuery(linodeId, interfaceId ?? -1, isLinodeInterface);

  // we still need to fetch the config this interface belongs to
  // so that we can determine if we have an unrecommended configuration
  const {
    data: config,
    error: configError,
    isLoading: configLoading,
  } = useLinodeConfigQuery(linodeId, configId ?? -1, !isLinodeInterface);

  const configInterface = config?.interfaces?.find(
    (iface) => iface.id === interfaceId
  );
  const interfaceData = linodeInterface ?? configInterface;
  const interfaceError = linodeInterfaceError ?? configError;
  const interfaceLoading = linodeInterfaceLoading ?? configLoading;

  const hasUnrecommendedSetup = isLinodeInterface
    ? isInterfaceActive && !linodeInterface?.default_route.ipv4
    : hasUnrecommendedConfiguration(config, subnetId);

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
    <Link
      to={`/linodes/${linode.id}${
        isLinodeInterface
          ? `/networking/interfaces/${subnetInterfaceData.id}`
          : ''
      }`}
    >
      {linode.label}
    </Link>
  );

  const labelCell =
    !isVPCLKEEnterpriseCluster && hasUnrecommendedSetup ? (
      <Box
        data-testid={WARNING_ICON_UNRECOMMENDED_CONFIG}
        sx={{ alignItems: 'center', display: 'flex' }}
      >
        <TooltipIcon
          text={
            <Typography>
              {isLinodeInterface
                ? '@TODO Linode Interfaces - confirm copy? This Linode’s Network Interfaces setup is not recommended. To avoid potential connectivity issues, set this Linode’s VPC interface as the default IPv4 route.'
                : 'This Linode is using a configuration profile with a Networking setting that is not recommended. To avoid potential connectivity issues, edit the Linode’s configuration.'}
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
    isRunning && !isLinodeInterface && !configInterface?.active;

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
            interfaceData,
            interfaceLoading,
            interfaceError ?? undefined
          )}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {getIPRangesCellContents(
            interfaceData,
            interfaceLoading,
            interfaceError ?? undefined
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
        {!isVPCLKEEnterpriseCluster && (
          <>
            {isRebootNeeded && (
              <InlineMenuAction
                onClick={() => {
                  handlePowerActionsLinode(linode, 'Reboot');
                }}
                actionText="Reboot"
                disabled={isVPCLKEEnterpriseCluster}
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
                disabled={isVPCLKEEnterpriseCluster}
              />
            )}
            <InlineMenuAction
              actionText="Unassign Linode"
              disabled={isVPCLKEEnterpriseCluster}
              onClick={() => handleUnassignLinode(linode, subnet)}
            />
          </>
        )}
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
  interfaceData: Interface | LinodeInterface | undefined,
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving VPC IPv4s';
  }

  if (!interfaceData) {
    return 'None';
  }

  if ('purpose' in interfaceData) {
    return getIPv4LinkForConfigInterface(interfaceData);
  } else {
    const primaryIPv4 = interfaceData.vpc?.ipv4.addresses.find(
      (address) => address.primary
    )?.address;
    return <span key={interfaceData.id}>{primaryIPv4 ?? 'None'}</span>;
  }
};

const getIPv4LinkForConfigInterface = (
  configInterface: Interface | undefined
): JSX.Element => {
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
  interfaceData: Interface | LinodeInterface | undefined,
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving VPC IPv4s';
  }

  if (!interfaceData) {
    return 'None';
  }

  if ('purpose' in interfaceData) {
    return determineNoneSingleOrMultipleWithChip(
      interfaceData?.ip_ranges ?? []
    );
  } else {
    const linodeInterfaceVPCRanges = interfaceData.vpc?.ipv4.ranges.map(
      (range) => range.range
    );
    return determineNoneSingleOrMultipleWithChip(
      linodeInterfaceVPCRanges ?? []
    );
  }
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
