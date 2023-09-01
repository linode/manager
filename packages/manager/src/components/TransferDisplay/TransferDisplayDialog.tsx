import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import BarPercent from 'src/components/BarPercent';
import { Box } from 'src/components/Box';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import { getDaysRemaining } from './utils';

interface DialogProps {
  generalPoolUsage: {
    quota: number;
    used: number;
  };
  generalPoolUsagePct: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferDisplayDialog = React.memo((props: DialogProps) => {
  const {
    generalPoolUsage: { quota, used },
    generalPoolUsagePct,
    isOpen,
    onClose,
  } = props;
  const theme = useTheme();
  const daysRemainingInMonth = getDaysRemaining();
  // Don't display usage, quota, or bar percent if the network transfer pool is empty (e.g. account has no resources).
  const isEmptyPool = quota === 0;
  const transferQuotaDocsText =
    used === 0
      ? 'Compute instances, NodeBalancers, and Object Storage include network transfer.'
      : 'View products and services that include network transfer, and learn how to optimize network usage to avoid billing surprises.';

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      title="Monthly Network Transfer Pool"
    >
      <Grid
        container
        justifyContent="space-between"
        spacing={2}
        sx={{ marginBottom: 0 }}
      >
        <Grid style={{ marginRight: 10 }}>
          {!isEmptyPool ? (
            <Typography>{used} GB Used</Typography>
          ) : (
            <Typography>
              Your monthly network transfer will be shown when you create a
              resource.
            </Typography>
          )}
        </Grid>
        <Grid>
          {!isEmptyPool ? (
            <Typography>
              {quota >= used ? (
                <span>{quota - used} GB Available</span>
              ) : (
                <span>
                  {(quota - used).toString().replace(/\-/, '')} GB Over Quota
                </span>
              )}
            </Typography>
          ) : null}
        </Grid>
      </Grid>
      {!isEmptyPool ? (
        <BarPercent max={100} rounded value={Math.ceil(generalPoolUsagePct)} />
      ) : null}

      <Typography
        sx={{ marginBottom: theme.spacing(), marginTop: theme.spacing() }}
      >
        <strong>
          Your account&rsquo;s monthly network transfer allotment will reset in{' '}
          {daysRemainingInMonth} days.
        </strong>
      </Typography>
      <Typography
        sx={{ marginBottom: theme.spacing(), marginTop: theme.spacing() }}
      >
        Your account&rsquo;s network transfer pool adds up all the included
        transfer associated with active Linode services on your account and is
        prorated based on service creation.
      </Typography>
      <Box>
        <Typography>
          {transferQuotaDocsText}
          <Box marginTop={2}>
            <Link to="https://www.linode.com/docs/guides/network-transfer-quota/">
              Learn more
            </Link>
          </Box>
          .
        </Typography>
      </Box>
    </Dialog>
  );
});
