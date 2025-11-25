import { Box, Paper, Stack, Typography } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Skeleton } from 'src/components/Skeleton';

import type { NetworkLoadBalancerListenerProtocol } from '@linode/api-v4';

interface Props {
  created: string;
  nodes: number;
  nodesLoading?: boolean;
  port: number;
  protocol: NetworkLoadBalancerListenerProtocol;
  updated: string;
}

export const NetworkLoadBalancersListenerDetailBody = ({
  created,
  nodes,
  nodesLoading,
  port,
  protocol,
  updated,
}: Props) => {
  return (
    <Box sx={{ maxWidth: '60%' }}>
      <Stack>
        <Paper>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <LabelTypography>Port</LabelTypography>
                <Typography>{port}</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <LabelTypography>Created</LabelTypography>
                <DateTimeDisplay value={created} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <LabelTypography>Protocol</LabelTypography>
                <Typography sx={{ textTransform: 'uppercase' }}>
                  {protocol}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <LabelTypography>Updated</LabelTypography>
                <DateTimeDisplay value={updated} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <LabelTypography>Nodes</LabelTypography>
                <Typography>{nodesLoading ? <Skeleton /> : nodes}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </Box>
  );
};

const LabelTypography = styled(Typography)(({ theme }) => ({
  font: theme.font.bold,
}));
