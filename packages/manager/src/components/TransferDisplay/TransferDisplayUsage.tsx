import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';

import { formatPoolUsagePct } from './utils';

export interface TransferDisplayUsageProps {
  pullUsagePct: number;
  quota: number;
  used: number;
}

export const TransferDisplayUsage = React.memo(
  (props: TransferDisplayUsageProps) => {
    const { pullUsagePct, quota, used } = props;

    const theme = useTheme();

    // Don't display usage, quota, or bar percent if the network transfer pool is empty (e.g. account has no resources).
    const isEmptyPool = quota === 0;

    return (
      <>
        {!isEmptyPool && (
          <BarPercent max={100} rounded value={Math.ceil(pullUsagePct)} />
        )}
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            marginBottom: 0,
            marginTop: (theme) => theme.spacing(0.5),
          }}
        >
          <Grid style={{ marginRight: 10 }}>
            {!isEmptyPool ? (
              <Typography fontSize={theme.typography.h3.fontSize}>
                {used} GB Used ({formatPoolUsagePct(pullUsagePct)})
              </Typography>
            ) : (
              <Typography>
                Your monthly network transfer will be shown when you create a
                resource.
              </Typography>
            )}
          </Grid>
          <Grid>
            {!isEmptyPool && (
              <Typography fontSize={theme.typography.h3.fontSize}>
                {quota >= used ? (
                  <span>{quota - used} GB Available</span>
                ) : (
                  <span>
                    {(quota - used).toString().replace(/\-/, '')} GB Over Quota
                  </span>
                )}
              </Typography>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
);
