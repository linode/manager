import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import BarPercent from 'src/components/BarPercent';
import { Typography } from 'src/components/Typography';

import { formatPoolUsagePct } from './utils';

export interface TransferDisplayUsageProps {
  pullUsagePct: number;
  quota: number;
  used: number;
}

export const TransferDisplayUsage = React.memo(
  (props: TransferDisplayUsageProps) => {
    const { pullUsagePct, quota, used } = props;
    // Don't display usage, quota, or bar percent if the network transfer pool is empty (e.g. account has no resources).
    const isEmptyPool = quota === 0;

    return (
      <>
        <Grid
          container
          justifyContent="space-between"
          spacing={2}
          sx={{ marginBottom: 0 }}
        >
          <Grid style={{ marginRight: 10 }}>
            {!isEmptyPool ? (
              <Typography>
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
              <Typography>
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
        {!isEmptyPool && (
          <BarPercent
            gradientFiller
            max={100}
            rounded
            value={Math.ceil(pullUsagePct)}
          />
        )}
      </>
    );
  }
);
