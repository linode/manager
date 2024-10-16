import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { HashLink } from 'react-router-hash-link';

import { Box } from 'src/components/Box';
import {
  DISK_ENCRYPTION_NODE_POOL_GUIDANCE_COPY as UNENCRYPTED_LKE_LINODE_GUIDANCE_COPY,
  UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY,
} from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { useProfile } from 'src/queries/profile/profile';
import { pluralize } from 'src/utilities/pluralize';

import { encryptionStatusTestId } from '../Kubernetes/KubernetesClusterDetail/NodePoolsDisplay/NodeTable';
import { EncryptedStatus } from '../Kubernetes/KubernetesClusterDetail/NodePoolsDisplay/NodeTable';
import {
  StyledBodyGrid,
  StyledColumnLabelGrid,
  StyledLabelBox,
  StyledListItem,
  StyledSummaryGrid,
  StyledVPCBox,
  sxLastListItem,
} from './LinodeEntityDetail.styles';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { VPC } from '@linode/api-v4/lib';
import type {
  EncryptionStatus,
  Interface,
  Linode,
} from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs';
import type { TypographyProps } from 'src/components/Typography';

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
  gbRAM: number;
  gbStorage: number;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  isLKELinode: boolean; // indicates whether linode belongs to an LKE cluster
  isVPCOnlyLinode: boolean;
  linodeId: number;
  linodeIsInDistributedRegion: boolean;
  linodeLabel: string;
  numCPUs: number;
  numVolumes: number;
  region: string;
  vpcLinodeIsAssignedTo?: VPC;
}

export const LinodeEntityDetailBody = React.memo((props: BodyProps) => {
  const {
    configInterfaceWithVPC,
    encryptionStatus,
    gbRAM,
    gbStorage,
    ipv4,
    ipv6,
    isLKELinode,
    isVPCOnlyLinode,
    linodeId,
    linodeIsInDistributedRegion,
    linodeLabel,
    numCPUs,
    numVolumes,
    region,
    vpcLinodeIsAssignedTo,
  } = props;

  const { data: profile } = useProfile();
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

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

  return (
    <>
      <StyledBodyGrid container spacing={2} sx={{ mb: 0 }}>
        <Grid
          container
          flexDirection={matchesLgUp ? 'row' : 'column'}
          sm={isDisplayingEncryptedStatus ? 4 : 3}
          spacing={0}
          xs={12}
        >
          <StyledColumnLabelGrid
            mb={matchesLgUp && !isDisplayingEncryptedStatus ? 0 : 2}
            xs={12}
          >
            Summary
          </StyledColumnLabelGrid>
          <StyledSummaryGrid container spacing={1}>
            <Grid alignItems="center" display="flex" lg={6} sm={12} xs={6}>
              <Typography>
                {pluralize('CPU Core', 'CPU Cores', numCPUs)}
              </Typography>
            </Grid>
            <Grid alignItems="center" display="flex" lg={6} sm={12} xs={6}>
              <Typography>{gbStorage} GB Storage</Typography>
            </Grid>
            <Grid lg={6} sm={12} xs={6}>
              <Typography>{gbRAM} GB RAM</Typography>
            </Grid>
            <Grid lg={6} sm={12} xs={6}>
              <Typography>
                {pluralize('Volume', 'Volumes', numVolumes)}
              </Typography>
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

        <Grid container sm={isDisplayingEncryptedStatus ? 8 : 9} xs={12}>
          <Grid container xs={12}>
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
              gridSize={{ lg: 5, xs: 12 }}
              isVPCOnlyLinode={isVPCOnlyLinode}
              rows={[{ text: firstAddress }, { text: secondAddress }]}
              sx={{ padding: 0 }}
              title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
            />
            <AccessTable
              rows={[
                { heading: 'SSH Access', text: sshLink(ipv4[0]) },
                {
                  heading: 'LISH Console via SSH',
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
              margin: 0,
              padding: '0 0 8px 0',
              [theme.breakpoints.down('md')]: {
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
              <StyledListItem>
                <StyledLabelBox component="span" data-testid="subnets-string">
                  Subnets:
                </StyledLabelBox>{' '}
                {getSubnetsString(linodeAssociatedSubnets ?? [])}
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem sx={{ ...sxLastListItem }}>
                <StyledLabelBox component="span" data-testid="vpc-ipv4">
                  VPC IPv4:
                </StyledLabelBox>{' '}
                {configInterfaceWithVPC?.ipv4?.vpc}
              </StyledListItem>
            </StyledVPCBox>
          </Grid>
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
