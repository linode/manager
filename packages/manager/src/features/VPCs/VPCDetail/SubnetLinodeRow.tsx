import { useLinodeQuery } from '@linode/queries';
import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { getFormattedStatus } from '@linode/utilities';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useFlags } from 'src/hooks/useFlags';
import { determineNoneSingleOrMultipleWithChip } from 'src/utilities/noneSingleOrMultipleWithChip';

import { useInterfaceDataForLinode } from '../../../hooks/useInterfaceDataForLinode';
import {
  VPC_REBOOT_MESSAGE,
  WARNING_ICON_UNRECOMMENDED_CONFIG,
} from '../constants';
import {
  hasUnrecommendedConfiguration as _hasUnrecommendedConfiguration,
  getLinodeInterfaceIPv4Ranges,
  getLinodeInterfaceIPv6Ranges,
  getLinodeInterfacePrimaryIPv4,
  hasUnrecommendedConfigurationLinodeInterface,
} from '../utils';
import { StyledWarningIcon } from './SubnetLinodeRow.styles';
import {
  ConfigInterfaceFirewallCell,
  LinodeInterfaceFirewallCell,
} from './SubnetLinodeRowFirewallsCell';

import type {
  APIError,
  Interface,
  Linode,
  LinodeInterface,
  Subnet,
  SubnetLinodeInterfaceData,
} from '@linode/api-v4';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface Props {
  handlePowerActionsLinode: (
    linode: Linode,
    action: Action,
    subnet?: Subnet
  ) => void;
  handleUnassignLinode: (linode: Linode, subnet?: Subnet) => void;
  hover?: boolean;
  isVPCLKEEnterpriseCluster: boolean;
  linodeId: number;
  subnet: Subnet;
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

  const flags = useFlags();

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

  /**
   * We need to handle support for both legacy interfaces and Linode interfaces.
   * The below hook gives us the relevant interface data depending on
   * interface type.
   */
  const { interfacesInfo } = useInterfaceDataForLinode({
    configId, // subnet.linodes.interfaces data now includes config_id, so we no longer have to fetch all configs
    interfaceId,
    isLinodeInterface,
    linodeId,
  });

  const {
    config, // undefined if this Linode is using Linode Interfaces. Used to determine an unrecommended configuration
    configInterface, // undefined if this Linode is using Linode Interfaces
    interfaceData,
    interfaceError,
    interfaceLoading,
    linodeInterface, // undefined if this Linode is using Config Profile Interfaces
  } = interfacesInfo;

  const hasUnrecommendedConfiguration = isLinodeInterface
    ? hasUnrecommendedConfigurationLinodeInterface(
        linodeInterface,
        isInterfaceActive
      )
    : _hasUnrecommendedConfiguration(config, subnetId);

  if (linodeLoading) {
    return (
      <TableRow hover={hover}>
        <TableCell colSpan={6} style={{ textAlign: 'center' }}>
          <CircleProgress size="sm" />
        </TableCell>
      </TableRow>
    );
  }

  if (linodeError || !linode) {
    return (
      <TableRow data-testid="subnet-linode-row-error" hover={hover}>
        <TableCell colSpan={6} style={{ justifyItems: 'center' }}>
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
    !isVPCLKEEnterpriseCluster && hasUnrecommendedConfiguration ? (
      <Box
        data-testid={WARNING_ICON_UNRECOMMENDED_CONFIG}
        sx={{ alignItems: 'center', display: 'flex' }}
      >
        <TooltipIcon
          icon={<StyledWarningIcon />}
          status="other"
          sxTooltipIcon={{ paddingLeft: 0 }}
          text={
            <Typography>
              {isLinodeInterface
                ? 'This Linode’s Network Interfaces setup is not recommended. To avoid potential connectivity issues, set this Linode’s VPC interface as the default IPv4 route.'
                : 'This Linode is using a configuration profile with a Networking setting that is not recommended. To avoid potential connectivity issues, edit the Linode’s configuration.'}
            </Typography>
          }
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
          getFormattedStatus(linode.status)
        )}
      </TableCell>
      <Hidden smDown>
        <TableCell>
          {getSubnetLinodeIPCellString({
            interfaceData,
            ipType: 'ipv4',
            loading: interfaceLoading,
            error: interfaceError ?? undefined,
          })}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {getIPRangesCellContents({
            interfaceData,
            ipType: 'ipv4',
            loading: interfaceLoading,
            error: interfaceError ?? undefined,
          })}
        </TableCell>
      </Hidden>
      {flags.vpcIpv6 && (
        <>
          <Hidden smDown>
            <TableCell>
              {getSubnetLinodeIPCellString({
                interfaceData,
                ipType: 'ipv6',
                loading: interfaceLoading,
                error: interfaceError ?? undefined,
              })}
            </TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell>
              {getIPRangesCellContents({
                interfaceData,
                ipType: 'ipv6',
                loading: interfaceLoading,
                error: interfaceError ?? undefined,
              })}
            </TableCell>
          </Hidden>
        </>
      )}
      <Hidden smDown>
        {isLinodeInterface ? (
          <LinodeInterfaceFirewallCell
            interfaceId={interfaceId}
            linodeId={linodeId}
          />
        ) : (
          <ConfigInterfaceFirewallCell linodeId={linodeId} />
        )}
      </Hidden>
      <TableCell actionCell>
        {!isVPCLKEEnterpriseCluster && (
          <>
            {isRebootNeeded && (
              <InlineMenuAction
                actionText="Reboot"
                disabled={isVPCLKEEnterpriseCluster}
                onClick={() => {
                  handlePowerActionsLinode(linode, 'Reboot', subnet);
                }}
              />
            )}
            {showPowerButton && (
              <InlineMenuAction
                actionText={isOffline ? 'Power On' : 'Power Off'}
                disabled={isVPCLKEEnterpriseCluster}
                onClick={() => {
                  handlePowerActionsLinode(
                    linode,
                    isOffline ? 'Power On' : 'Power Off',
                    subnet
                  );
                }}
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

type InterfaceDataTypes = Interface | LinodeInterface | undefined;
interface IPCellStringInputs {
  error?: APIError[];
  interfaceData: InterfaceDataTypes;
  ipType: 'ipv4' | 'ipv6';
  loading: boolean;
}

const getSubnetLinodeIPCellString = (
  ipCellStringInputs: IPCellStringInputs
): JSX.Element | string => {
  const { error, interfaceData, ipType, loading } = ipCellStringInputs;
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return `Error retrieving VPC ${ipType === 'ipv4' ? 'IPv4s' : 'IPv6s'}`;
  }

  if (!interfaceData) {
    return 'None';
  }

  if ('purpose' in interfaceData) {
    // presence of `purpose` property indicates it is a Config Profile/legacy interface
    return ipType === 'ipv4'
      ? getIPLinkForConfigInterface(interfaceData, 'ipv4')
      : getIPLinkForConfigInterface(interfaceData, 'ipv6');
  } else {
    if (ipType === 'ipv4') {
      const primaryIPv4 = getLinodeInterfacePrimaryIPv4(interfaceData);
      return <span key={interfaceData.id}>{primaryIPv4 ?? 'None'}</span>;
    }

    return (
      <span key={interfaceData.id}>
        {interfaceData.vpc?.ipv6?.slaac[0].address}
      </span>
    );
  }
};

const getIPLinkForConfigInterface = (
  configInterface: Interface | undefined,
  ipType: 'ipv4' | 'ipv6'
): JSX.Element => {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {configInterface && (
        <span key={configInterface.id}>
          {ipType === 'ipv4'
            ? configInterface.ipv4?.vpc
            : configInterface.ipv6?.slaac[0].address}
        </span>
      )}
    </>
  );
};

interface IPRangesCellStringInputs {
  error?: APIError[];
  interfaceData: InterfaceDataTypes;
  ipType: 'ipv4' | 'ipv6';
  loading: boolean;
}

const getIPRangesCellContents = (
  ipRangesCellStringInputs: IPRangesCellStringInputs
): JSX.Element | string => {
  const { error, interfaceData, ipType, loading } = ipRangesCellStringInputs;

  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return `Error retrieving VPC ${ipType === 'ipv4' ? 'IPv4' : 'IPv6'}s`;
  }

  if (!interfaceData) {
    return 'None';
  }

  if ('purpose' in interfaceData) {
    // presence of `purpose` property indicates it is a Config Profile/legacy interface
    if (ipType === 'ipv4') {
      return determineNoneSingleOrMultipleWithChip(
        interfaceData.ip_ranges ?? []
      );
    }

    const ipv6Ranges =
      interfaceData.ipv6?.ranges
        .map((rangeObj) => rangeObj.range)
        .filter((range) => range !== undefined) ?? [];

    return determineNoneSingleOrMultipleWithChip(ipv6Ranges);
  } else {
    const linodeInterfaceVPCRanges =
      ipType === 'ipv4'
        ? getLinodeInterfaceIPv4Ranges(interfaceData)
        : getLinodeInterfaceIPv6Ranges(interfaceData);
    return determineNoneSingleOrMultipleWithChip(
      linodeInterfaceVPCRanges ?? []
    );
  }
};

export const SubnetLinodeTableRowHead = (
  vpcIPv6FeatureFlag: boolean = false
) => (
  <TableRow>
    <TableCell>Linode</TableCell>
    <TableCell sx={{ width: '14%' }}>Status</TableCell>
    <Hidden smDown>
      <TableCell>VPC IPv4</TableCell>
    </Hidden>
    <Hidden smDown>
      <TableCell>
        {`${vpcIPv6FeatureFlag ? 'Linode' : 'VPC'}`} IPv4 Ranges
      </TableCell>
    </Hidden>
    {vpcIPv6FeatureFlag && (
      <Hidden smDown>
        <TableCell>VPC IPv6</TableCell>
      </Hidden>
    )}
    {vpcIPv6FeatureFlag && (
      <Hidden smDown>
        <TableCell>Linode IPv6 Ranges</TableCell>
      </Hidden>
    )}
    <Hidden smDown>
      <TableCell>Firewalls</TableCell>
    </Hidden>
    <TableCell />
  </TableRow>
);
