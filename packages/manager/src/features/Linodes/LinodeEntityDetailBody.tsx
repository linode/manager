import { usePreferences, useProfile } from '@linode/queries';
import { Box, Stack, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { useKubernetesBetaEndpoint } from 'src/features/Kubernetes/kubeUtils';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { ipTableId } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';

import { HighPerformanceVolumeIcon } from './HighPerformanceVolumeIcon';
import { LinodeEncryptionStatus } from './LinodeEncryptionStatus';
import {
  StyledBodyGrid,
  StyledColumnLabelGrid,
  StyledCopyTooltip,
  StyledIPBox,
  StyledIPItem,
  StyledIPLabel,
  StyledLabelBox,
  StyledListItem,
  StyledVPCBox,
  sxLastListItem,
} from './LinodeEntityDetail.styles';
import { StyledIPStack } from './LinodeEntityDetailBody.styles';
import { LinodeEntityDetailRowConfigFirewall } from './LinodeEntityDetailRowConfigFirewall';
import { LinodeEntityDetailRowInterfaceFirewall } from './LinodeEntityDetailRowInterfaceFirewall';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { getSubnetsString, getVPCIPv4, getVPCIPv6 } from './utilities';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  EncryptionStatus,
  Interface,
  InterfaceGenerationType,
  Linode,
  LinodeCapabilities,
  LinodeInterface,
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
  isUnreachablePublicIPv4: boolean;
  isUnreachablePublicIPv6: boolean;
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
    encryptionStatus,
    gbRAM,
    gbStorage,
    isUnreachablePublicIPv4,
    interfaceGeneration,
    interfaceWithVPC,
    ipv4,
    ipv6,
    isUnreachablePublicIPv6,
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

  const flags = useFlags();

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
  const vpcIPv6 = getVPCIPv6(interfaceWithVPC);

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
                <LinodeEncryptionStatus linodeId={linodeId} />
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
                    <Link
                      hash={ipTableId}
                      params={{ linodeId }}
                      to={'/linodes/$linodeId/networking'}
                    >
                      View all IP Addresses
                    </Link>
                  </Typography>
                ) : undefined
              }
              gridSize={{ lg: 5, xs: 12 }}
              hasPublicInterface={isUnreachablePublicIPv6}
              isLinodeInterface={isLinodeInterface}
              rows={[
                {
                  isMasked: maskSensitiveDataPreference,
                  maskedTextLength: 'ipv4',
                  text: firstAddress,
                  disabled: isUnreachablePublicIPv4,
                },
                {
                  isMasked: maskSensitiveDataPreference,
                  maskedTextLength: 'ipv6',
                  text: secondAddress,
                  disabled: isUnreachablePublicIPv6,
                },
              ]}
              sx={{ padding: 0 }}
              title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
            />
            <AccessTable
              gridSize={{ lg: 7, xs: 12 }}
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
              [theme.breakpoints.down('lg')]: {
                alignItems: 'start',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <Stack
              direction="row"
              sx={{
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
            </Stack>
            <StyledIPStack direction="row">
              {vpcIPv4 && (
                <StyledIPBox>
                  <StyledIPLabel data-testid="vpc-ipv4-label">
                    VPC IPv4
                  </StyledIPLabel>
                  <StyledIPItem component="span" data-testid="vpc-ipv4">
                    <CopyTooltip copyableText text={vpcIPv4} />
                    <Box sx={{ ml: 1, position: 'relative', top: 1 }}>
                      <StyledCopyTooltip text={vpcIPv4} />
                    </Box>
                  </StyledIPItem>
                </StyledIPBox>
              )}
              {flags.vpcIpv6 &&
                vpcIPv6 && ( // @TODO VPC IPv6: remove flag check once VPC IPv6 is fully rolled out
                  <StyledIPBox>
                    <StyledIPLabel data-testid="vpc-ipv6-label">
                      VPC IPv6
                    </StyledIPLabel>
                    <StyledIPItem component="span" data-testid="vpc-ipv6">
                      <CopyTooltip copyableText text={vpcIPv6} />
                      <Box sx={{ ml: 1, position: 'relative', top: 1 }}>
                        <StyledCopyTooltip text={vpcIPv6} />
                      </Box>
                    </StyledIPItem>
                  </StyledIPBox>
                )}
            </StyledIPStack>
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
