import { usePreferences, useProfile } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { HashLink } from 'react-router-hash-link';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY } from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { useKubernetesBetaEndpoint } from 'src/features/Kubernetes/kubeUtils';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';

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
import { LinodeEntityDetailRowConfigFirewall } from './LinodeEntityDetailRowConfigFirewall';
import { LinodeEntityDetailRowInterfaceFirewall } from './LinodeEntityDetailRowInterfaceFirewall';
import { ipTableId } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  EncryptionStatus,
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

  const { data: profile } = useProfile();

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const isLinodeInterface = interfaceGeneration === 'linode';
  const vpcIPv4 = getVPCIPv4(interfaceWithVPC);

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
      {isLinodeInterface ? (
        <LinodeEntityDetailRowInterfaceFirewall
          cluster={cluster}
          linodeId={linodeId}
          linodeLkeClusterId={linodeLkeClusterId}
        />
      ) : (
        <LinodeEntityDetailRowConfigFirewall
          cluster={cluster}
          interfaceGeneration={interfaceGeneration}
          linodeId={linodeId}
          linodeLkeClusterId={linodeLkeClusterId}
          region={region}
        />
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
