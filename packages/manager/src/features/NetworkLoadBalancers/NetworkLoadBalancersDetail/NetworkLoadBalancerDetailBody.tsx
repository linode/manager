import { useProfile, useRegionQuery } from '@linode/queries';
import { Box, Stack, Typography } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { StyledBodyGrid } from 'src/features/Linodes/LinodeEntityDetail.styles';
import { formatDate } from 'src/utilities/formatDate';

import type { LKEClusterInfo } from '@linode/api-v4';

interface NetworkLoadBalancerDetailBodyInterface {
  addressV4: string;
  addressV6: string;
  createdDate: string;
  lkeCluster?: LKEClusterInfo;
  nlbId: number;
  region: string;
  updatedDate: string;
}

export const NetworkLoadBalancerDetailBody = (
  props: NetworkLoadBalancerDetailBodyInterface
) => {
  const {
    addressV4,
    addressV6,
    createdDate,
    lkeCluster,
    nlbId,
    region,
    updatedDate,
  } = props;

  const { data: profile } = useProfile();
  const { data: regionData } = useRegionQuery(region);

  const regionLabel = regionData?.label ?? region;

  return (
    <StyledBodyGrid container spacing={2} sx={{ mb: 0 }}>
      <Grid
        container
        direction="row"
        size={{
          sm: 6,
          xs: 12,
        }}
      >
        <Grid
          size={{
            sm: 6,
          }}
        >
          <Stack spacing={2}>
            <Box>
              <StyledTypography>Region</StyledTypography>
              {regionLabel}
            </Box>
            <Box>
              <StyledTypography>LKE-E Cluster</StyledTypography>
              {lkeCluster ? (
                <>
                  <Link
                    accessibleAriaLabel={`LKE-E Cluster ${lkeCluster.label}`}
                    className="secondaryLink"
                    to={`/lke/clusters/${lkeCluster.id}`}
                  >
                    {lkeCluster.label}
                  </Link>
                  {` (ID: ${lkeCluster.id})`}
                </>
              ) : (
                'N/A'
              )}
            </Box>
            <Box>
              <StyledTypography>Network Load Balancer ID</StyledTypography>
              {nlbId}
            </Box>
          </Stack>
        </Grid>
        <Grid
          size={{
            sm: 6,
          }}
        >
          <Stack spacing={2}>
            <Box>
              <StyledTypography>Created</StyledTypography>
              {formatDate(createdDate, {
                timezone: profile?.timezone,
              })}
            </Box>
            <Box>
              <StyledTypography>Updated</StyledTypography>
              {formatDate(updatedDate, {
                timezone: profile?.timezone,
              })}
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        size={{
          sm: 6,
          xs: 12,
        }}
      >
        <Grid container size={12}>
          <AccessTable
            gridSize={{ lg: 12, xs: 12 }}
            rows={[
              {
                heading: 'Virtual IP (IPv4)',
                isMasked: false,
                text: `${addressV4}`,
              },
              {
                heading: 'Virtual IP (IPv6)',
                isMasked: false,
                text: `${addressV6}`,
              },
            ]}
            sx={{ padding: 0 }}
            title=""
          />
        </Grid>
      </Grid>
    </StyledBodyGrid>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  font: theme.font.bold,
}));
