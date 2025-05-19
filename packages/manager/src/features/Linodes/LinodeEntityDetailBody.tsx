import { usePreferences, useProfile } from '@linode/queries';
import { Box, Chip, Tooltip, TooltipIcon, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY } from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { useKubernetesBetaEndpoint } from 'src/features/Kubernetes/kubeUtils';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { useCanUpgradeInterfaces } from 'src/hooks/useCanUpgradeInterfaces';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { EncryptedStatus } from '../Kubernetes/KubernetesClusterDetail/NodePoolsDisplay/NodeTable';
import { encryptionStatusTestId } from '../Kubernetes/KubernetesClusterDetail/NodePoolsDisplay/NodeTable';
import { HighPerformanceVolumeIcon } from './HighPerformanceVolumeIcon';
import {
  StyledBodyGrid,
  StyledColumnLabelGrid,
  StyledCopyTooltip,
  StyledIPv4Box,
  StyledIPv4Item,
  StyledIPv4Label,
  StyledLabelBox,
  StyledListItem,
  StyledVPCBox,
  sxLastListItem,
} from './LinodeEntityDetail.styles';
import { DEFAULT_UPGRADE_BUTTON_HELPER_TEXT } from './LinodesDetail/LinodeConfigs/LinodeConfigs';
import { getUnableToUpgradeTooltipText } from './LinodesDetail/LinodeConfigs/UpgradeInterfaces/utils';
import { ipTableId } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  EncryptionStatus,
  Firewall,
  Interface,
  InterfaceGenerationType,
  Linode,
  LinodeCapabilities,
  LinodeInterface,
  Subnet,
  VPC,
} from '@linode/api-v4';
import type { TypographyProps } from '@linode/ui';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export interface Props extends LinodeEntityDetailProps {
  handlers: LinodeHandlers;
}

export interface BodyProps {
  encryptionStatus: EncryptionStatus | undefined;
  firewalls: Firewall[];
  gbRAM: number;
  gbStorage: number;
  interfaceGeneration: InterfaceGenerationType | undefined;
  interfaceWithVPC?: Interface | LinodeInterface;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  isLKELinode: boolean; // indicates whether linode belongs to an LKE cluster
  isVPCOnlyLinode: boolean;
  linodeCapabilities: LinodeCapabilities[];
  linodeId: number;
  linodeIsInDistributedRegion: boolean;
  linodeLabel: string;
  linodeLkeClusterId: null | number;
  numCPUs: number;
  numVolumes: number;
  region: string;
  regionSupportsDiskEncryption: boolean;
  vpcLinodeIsAssignedTo?: VPC;
}

export const LinodeEntityDetailBody = React.memo((props: BodyProps) => {
  const {
    encryptionStatus,
    firewalls,
    gbRAM,
    gbStorage,
    interfaceGeneration,
    interfaceWithVPC,
    ipv4,
    ipv6,
    isLKELinode,
    isVPCOnlyLinode,
    linodeCapabilities,
    linodeId,
    linodeIsInDistributedRegion,
    linodeLabel,
    linodeLkeClusterId,
    numCPUs,
    numVolumes,
    region,
    regionSupportsDiskEncryption,
    vpcLinodeIsAssignedTo,
  } = props;

  const location = useLocation();
  const history = useHistory();

  const openUpgradeInterfacesDialog = () => {
    history.replace(`${location.pathname}/upgrade-interfaces`);
  };

  const { data: profile } = useProfile();

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const isLinodeInterface = interfaceGeneration === 'linode';
  const vpcIPv4 = getVPCIPv4(interfaceWithVPC);

  const { canUpgradeInterfaces, unableToUpgradeReasons } =
    useCanUpgradeInterfaces(linodeLkeClusterId, region, interfaceGeneration);

  const unableToUpgradeTooltipText = getUnableToUpgradeTooltipText(
    unableToUpgradeReasons
  );

  // Take the first firewall to display. Linodes with legacy config interfaces can only be assigned to one firewall (currently). We'll only display
  // the attached firewall for Linodes with legacy config interfaces - Linodes with new Linode interfaces can be associated with multiple firewalls
  // since each interface can have a firewall.
  const attachedFirewall = firewalls.length > 0 ? firewalls[0] : undefined;

  // @TODO LDE: Remove usages of this variable once LDE is fully rolled out (being used to determine formatting adjustments currently)
  const isDisplayingEncryptedStatus =
    isDiskEncryptionFeatureEnabled && Boolean(encryptionStatus);

  // Filter and retrieve subnets associated with a specific Linode ID
  const linodeAssociatedSubnets = vpcLinodeIsAssignedTo?.subnets.filter(
    (subnet) => subnet.linodes.some((linode) => linode.id === linodeId)
  );

  const numIPAddresses = ipv4.length + (ipv6 ? 1 : 0);

  const firstAddress = ipv4[0];

  // If IPv6 is enabled, always use it in the second address slot. Otherwise use
  // the second IPv4 address if it exists.
  const secondAddress = ipv6 ? ipv6 : ipv4.length > 1 ? ipv4[1] : null;
  const matchesLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const { isAPLAvailabilityLoading, isUsingBetaEndpoint } =
    useKubernetesBetaEndpoint();

  const { data: cluster } = useKubernetesClusterQuery({
    enabled: Boolean(linodeLkeClusterId) && !isAPLAvailabilityLoading,
    id: linodeLkeClusterId ?? -1,
    isUsingBetaEndpoint,
  });

  return (
    <>
      <StyledBodyGrid container spacing={2} sx={{ mb: 0 }}>
        <Grid
          container
          size={{
            sm: isDisplayingEncryptedStatus ? 4 : 3,
            xs: 12,
          }}
          spacing={0}
          sx={{
            flexDirection: matchesLgUp ? 'row' : 'column',
          }}
        >
          <StyledColumnLabelGrid
            mb={matchesLgUp && !isDisplayingEncryptedStatus ? 0 : 2}
            size={{ xs: 12 }}
          >
            Summary
          </StyledColumnLabelGrid>
          <Grid container spacing={1}>
            <Grid
              size={{
                lg: 6,
                sm: 12,
                xs: 6,
              }}
              sx={{
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Typography>
                {pluralize('CPU Core', 'CPU Cores', numCPUs)}
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 6,
                sm: 12,
                xs: 6,
              }}
              sx={{
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Typography>{gbStorage} GB Storage</Typography>
            </Grid>
            <Grid
              size={{
                lg: 6,
                sm: 12,
                xs: 6,
              }}
            >
              <Typography>{gbRAM} GB RAM</Typography>
            </Grid>
            <Grid
              size={{
                lg: 6,
                sm: 12,
                xs: 6,
              }}
            >
              <Box
                sx={(theme) => ({
                  alignItems: 'center',
                  display: 'flex',
                  gap: theme.spacing(),
                })}
              >
                <Typography>
                  {pluralize('Volume', 'Volumes', numVolumes)}
                </Typography>

                {numVolumes > 0 && (
                  <HighPerformanceVolumeIcon
                    linodeCapabilities={linodeCapabilities}
                  />
                )}
              </Box>
            </Grid>
            {isDiskEncryptionFeatureEnabled && encryptionStatus && (
              <Grid>
                <Box
                  alignItems="center"
                  data-testid={encryptionStatusTestId}
                  display="flex"
                  flexDirection="row"
                >
                  <EncryptedStatus
                    encryptionStatus={encryptionStatus}
                    regionSupportsDiskEncryption={regionSupportsDiskEncryption}
                    tooltipText={
                      isLKELinode
                        ? undefined
                        : UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY
                    }
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid
          container
          size={{
            sm: isDisplayingEncryptedStatus ? 8 : 9,
            xs: 12,
          }}
        >
          <Grid container size={12}>
            <AccessTable
              footer={
                numIPAddresses > 2 ? (
                  <Typography
                    sx={{ position: matchesLgUp ? 'absolute' : 'relative' }}
                    variant="body1"
                  >
                    <HashLink
                      to={`/linodes/${linodeId}/networking#${ipTableId}`}
                    >
                      View all IP Addresses
                    </HashLink>
                  </Typography>
                ) : undefined
              }
              gridSize={{ lg: 5, xs: 12 }}
              isLinodeInterface={isLinodeInterface}
              isVPCOnlyLinode={isVPCOnlyLinode}
              rows={[
                {
                  isMasked: maskSensitiveDataPreference,
                  maskedTextLength: 'ipv4',
                  text: firstAddress,
                },
                {
                  isMasked: maskSensitiveDataPreference,
                  maskedTextLength: 'ipv6',
                  text: secondAddress,
                },
              ]}
              sx={{ padding: 0 }}
              title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
            />
            <AccessTable
              gridSize={{ lg: 7, xs: 12 }}
              isLinodeInterface={isLinodeInterface}
              isVPCOnlyLinode={isVPCOnlyLinode}
              rows={[
                {
                  heading: 'SSH Access',
                  isMasked: maskSensitiveDataPreference,
                  text: sshLink(ipv4[0]),
                },
                {
                  heading: 'LISH Console via SSH',
                  isMasked: !linodeIsInDistributedRegion
                    ? maskSensitiveDataPreference
                    : false,
                  text: linodeIsInDistributedRegion
                    ? 'N/A'
                    : lishLink(username, region, linodeLabel),
                },
              ]}
              sx={{ padding: 0, pt: matchesLgUp ? 0 : 2 }}
              title="Access"
            />
          </Grid>
        </Grid>
      </StyledBodyGrid>
      {vpcLinodeIsAssignedTo && (
        <Grid
          container
          direction="column"
          spacing={1}
          sx={{
            borderTop: `1px solid ${theme.borderColors.borderTable}`,
            padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(16)}`,
          }}
        >
          <StyledColumnLabelGrid data-testid="vpc-section-title">
            VPC
          </StyledColumnLabelGrid>
          <Grid
            container
            direction="row"
            spacing={0}
            sx={{
              alignItems: 'center',
              margin: 0,
              padding: '0 0 8px 0',
              [theme.breakpoints.down('md')]: {
                alignItems: 'start',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <StyledVPCBox>
              <StyledListItem sx={{ paddingLeft: 0 }}>
                <StyledLabelBox component="span">Label:</StyledLabelBox>{' '}
                <Link
                  data-testid="assigned-vpc-label"
                  to={`/vpcs/${vpcLinodeIsAssignedTo.id}`}
                >
                  {vpcLinodeIsAssignedTo.label}
                </Link>
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem sx={{ ...sxLastListItem }}>
                <StyledLabelBox component="span" data-testid="subnets-string">
                  Subnet:
                </StyledLabelBox>{' '}
                {getSubnetsString(linodeAssociatedSubnets ?? [])}
              </StyledListItem>
            </StyledVPCBox>
            {vpcIPv4 && (
              <StyledIPv4Box>
                <StyledIPv4Label data-testid="vpc-ipv4">
                  VPC IPv4
                </StyledIPv4Label>
                <StyledIPv4Item component="span" data-testid="vpc-ipv4">
                  <CopyTooltip copyableText text={vpcIPv4} />
                  <Box sx={{ ml: 1, position: 'relative', top: 1 }}>
                    <StyledCopyTooltip text={vpcIPv4} />
                  </Box>
                </StyledIPv4Item>
              </StyledIPv4Box>
            )}
          </Grid>
        </Grid>
      )}
      {(linodeLkeClusterId ||
        attachedFirewall ||
        isLinodeInterfacesEnabled) && (
        <Grid
          container
          direction="row"
          sx={{
            borderTop: `1px solid ${theme.borderColors.borderTable}`,
            padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(
              16
            )} ${theme.spacingFunction(8)} ${theme.spacingFunction(16)}`,
            [theme.breakpoints.down('md')]: {
              paddingLeft: 2,
            },
          }}
        >
          {linodeLkeClusterId && (
            <StyledListItem
              sx={{
                ...(!attachedFirewall && !isLinodeInterfacesEnabled
                  ? { borderRight: 'unset' }
                  : {}),
                paddingLeft: 0,
              }}
            >
              <StyledLabelBox component="span">LKE Cluster:</StyledLabelBox>{' '}
              <Link
                data-testid="assigned-lke-cluster-label"
                to={`/kubernetes/clusters/${linodeLkeClusterId}`}
              >
                {cluster?.label ?? `${linodeLkeClusterId}`}
              </Link>
              &nbsp;
              {cluster ? `(ID: ${linodeLkeClusterId})` : undefined}
            </StyledListItem>
          )}
          {!isLinodeInterface && attachedFirewall && (
            <StyledListItem
              sx={{
                ...(!isLinodeInterfacesEnabled ? { borderRight: 'unset' } : {}),
                ...(!linodeLkeClusterId ? { paddingLeft: 0 } : {}),
              }}
            >
              <StyledLabelBox component="span">Firewall:</StyledLabelBox>{' '}
              <Link
                data-testid="assigned-firewall"
                to={`/firewalls/${attachedFirewall.id}`}
              >
                {attachedFirewall.label ?? `${attachedFirewall.id}`}
              </Link>
              &nbsp;
              {attachedFirewall && `(ID: ${attachedFirewall.id})`}
            </StyledListItem>
          )}
          {isLinodeInterfacesEnabled && (
            <StyledListItem
              sx={{
                ...(!linodeLkeClusterId &&
                (isLinodeInterface || !attachedFirewall)
                  ? { paddingLeft: 0 }
                  : {}),
                borderRight: 'unset',
              }}
            >
              <StyledLabelBox component="span">Interfaces:</StyledLabelBox>{' '}
              {isLinodeInterface ? (
                'Linode'
              ) : (
                <Box
                  component="span"
                  sx={{ alignItems: 'center', display: 'flex' }}
                >
                  Configuration Profile
                  <span>
                    <Tooltip
                      slotProps={{
                        tooltip: {
                          sx: {
                            maxWidth: '260px',
                          },
                        },
                      }}
                      sx={{ width: '500px' }}
                      title={DEFAULT_UPGRADE_BUTTON_HELPER_TEXT}
                    >
                      <Chip
                        aria-label="Upgrade Configuration Profile Interfaces to Linode Interfaces"
                        component="span"
                        disabled={!canUpgradeInterfaces}
                        label="UPGRADE"
                        onClick={openUpgradeInterfacesDialog}
                        size="small"
                        sx={(theme) => ({
                          backgroundColor: theme.color.tagButtonBg,
                          color: theme.tokens.color.Neutrals[80],
                          marginLeft: theme.spacingFunction(12),
                        })}
                      />
                    </Tooltip>
                    {!canUpgradeInterfaces && unableToUpgradeTooltipText && (
                      <TooltipIcon
                        status="help"
                        sxTooltipIcon={{ padding: 0 }}
                        text={unableToUpgradeTooltipText}
                      />
                    )}
                  </span>
                </Box>
              )}
            </StyledListItem>
          )}
        </Grid>
      )}
    </>
  );
});

export const getSubnetsString = (data: Subnet[]) => {
  const firstThreeSubnets = data.slice(0, 3);
  const subnetLabels = firstThreeSubnets.map((subnet) => subnet.label);
  const firstThreeSubnetsString = subnetLabels.join(', ');

  return data.length > 3
    ? firstThreeSubnetsString.concat(`, plus ${data.length - 3} more.`)
    : firstThreeSubnetsString;
};

export const getVPCIPv4 = (
  interfaceWithVPC: Interface | LinodeInterface | undefined
) => {
  if (interfaceWithVPC) {
    if ('purpose' in interfaceWithVPC) {
      return interfaceWithVPC.ipv4?.vpc;
    }
    return interfaceWithVPC.vpc?.ipv4?.addresses.find(
      (address) => address.primary
    )?.address;
  }

  return undefined;
};
