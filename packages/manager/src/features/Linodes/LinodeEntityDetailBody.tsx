import { Box, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { HashLink } from 'react-router-hash-link';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import {
  DISK_ENCRYPTION_NODE_POOL_GUIDANCE_COPY as UNENCRYPTED_LKE_LINODE_GUIDANCE_COPY,
  UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY,
} from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';
import { usePreferences } from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { pluralize } from 'src/utilities/pluralize';

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
  StyledSummaryGrid,
  StyledVPCBox,
  sxLastListItem,
} from './LinodeEntityDetail.styles';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  EncryptionStatus,
  Firewall,
  Interface,
  InterfaceGenerationType,
  Linode,
  LinodeCapabilities,
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
  configInterfaceWithVPC?: Interface;
  encryptionStatus: EncryptionStatus | undefined;
  firewalls: Firewall[];
  gbRAM: number;
  gbStorage: number;
  interfaceGeneration: InterfaceGenerationType | undefined;
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
  vpcLinodeIsAssignedTo?: VPC;
}

export const LinodeEntityDetailBody = React.memo((props: BodyProps) => {
  const {
    configInterfaceWithVPC,
    encryptionStatus,
    firewalls,
    gbRAM,
    gbStorage,
    interfaceGeneration,
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
    vpcLinodeIsAssignedTo,
  } = props;

  const { data: profile } = useProfile();

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const linodeInterfacesFlag = useIsLinodeInterfacesEnabled();
  const isLinodeInterface = interfaceGeneration === 'linode';
  // Take the first firewall to display. Linodes with legacy config interfaces can only be assigned to one firewall (for now). We'll only display
  // the attached firewall for legacy config interfaces since Linodes with the new interfaces can be associated with multiple firewalls.
  const attachedFirewall = firewalls.length > 0 ? firewalls[0] : undefined;

  // @ TODO LDE: Remove usages of this variable once LDE is fully rolled out (being used to determine formatting adjustments currently)
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

  const { data: cluster } = useKubernetesClusterQuery(
    linodeLkeClusterId ?? -1,
    Boolean(linodeLkeClusterId)
  );

  return (
    <>
      <StyledBodyGrid container spacing={2} sx={{ mb: 0 }}>
        <Grid
          size={{
            sm: isDisplayingEncryptedStatus ? 4 : 3,
            xs: 12,
          }}
          sx={{
            flexDirection: matchesLgUp ? 'row' : 'column',
          }}
          container
          spacing={0}
        >
          <StyledColumnLabelGrid
            mb={matchesLgUp && !isDisplayingEncryptedStatus ? 0 : 2}
            size={{ xs: 12 }}
          >
            Summary
          </StyledColumnLabelGrid>
          <StyledSummaryGrid container spacing={1}>
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
                    tooltipText={
                      isLKELinode
                        ? UNENCRYPTED_LKE_LINODE_GUIDANCE_COPY
                        : UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY
                    }
                    encryptionStatus={encryptionStatus}
                  />
                </Box>
              </Grid>
            )}
          </StyledSummaryGrid>
        </Grid>

        <Grid
          size={{
            sm: isDisplayingEncryptedStatus ? 8 : 9,
            xs: 12,
          }}
          container
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
                      to={`/linodes/${linodeId}/networking#${ipv4TableID}`}
                    >
                      View all IP Addresses
                    </HashLink>
                  </Typography>
                ) : undefined
              }
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
              gridSize={{ lg: 5, xs: 12 }}
              isVPCOnlyLinode={isVPCOnlyLinode}
              sx={{ padding: 0 }}
              title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
            />
            <AccessTable
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
              gridSize={{ lg: 7, xs: 12 }}
              isVPCOnlyLinode={isVPCOnlyLinode}
              sx={{ padding: 0, pt: matchesLgUp ? 0 : 2 }}
              title="Access"
            />
          </Grid>
        </Grid>
      </StyledBodyGrid>
      {vpcLinodeIsAssignedTo && (
        <Grid
          sx={{
            borderTop: `1px solid ${theme.borderColors.borderTable}`,
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          }}
          container
          direction="column"
          spacing={2}
        >
          <StyledColumnLabelGrid data-testid="vpc-section-title">
            VPC
          </StyledColumnLabelGrid>
          <Grid
            sx={{
              alignItems: 'center',
              margin: 0,
              padding: '0 0 8px 0',

              [theme.breakpoints.down('md')]: {
                alignItems: 'start',
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: '8px',
              },
            }}
            container
            direction="row"
            spacing={2}
          >
            <StyledVPCBox>
              <StyledListItem>
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
            {configInterfaceWithVPC?.ipv4?.vpc && (
              <StyledIPv4Box>
                <StyledIPv4Label data-testid="vpc-ipv4">
                  VPC IPv4
                </StyledIPv4Label>
                <StyledIPv4Item component="span" data-testid="vpc-ipv4">
                  <CopyTooltip
                    copyableText
                    text={configInterfaceWithVPC.ipv4.vpc}
                  />
                  <Box sx={{ ml: 1, position: 'relative', top: 1 }}>
                    <StyledCopyTooltip text={configInterfaceWithVPC.ipv4.vpc} />
                  </Box>
                </StyledIPv4Item>
              </StyledIPv4Box>
            )}
          </Grid>
        </Grid>
      )}
      <Grid
        sx={{
          borderTop: `1px solid ${theme.borderColors.borderTable}`,
          padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
          [theme.breakpoints.down('md')]: {
            paddingLeft: 3,
          },
        }}
        container
        direction="row"
      >
        {!linodeLkeClusterId && (
          <StyledListItem
            sx={{
              ...(!linodeInterfacesFlag?.enabled
                ? { borderRight: 'unset' }
                : {}),
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
        {linodeInterfacesFlag?.enabled && (
          <>
            {!isLinodeInterface && attachedFirewall && (
              <StyledListItem>
                <StyledLabelBox component="span">Firewall:</StyledLabelBox>{' '}
                <Link
                  data-testid="assigned-lke-cluster-label"
                  to={`/kubernetes/clusters/${attachedFirewall.id}`}
                >
                  {attachedFirewall.label ?? `${attachedFirewall.id}`}
                </Link>
                &nbsp;
                {attachedFirewall && `(ID: ${attachedFirewall.id})`}
              </StyledListItem>
            )}
            <StyledListItem sx={{ borderRight: 'unset' }}>
              <StyledLabelBox component="span">Interfaces:</StyledLabelBox>{' '}
              {isLinodeInterface ? 'Linode' : 'Configuration Profile'}
            </StyledListItem>
          </>
        )}
      </Grid>
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
