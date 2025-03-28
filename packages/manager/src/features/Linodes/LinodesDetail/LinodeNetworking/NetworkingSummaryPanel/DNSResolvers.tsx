import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { useRegionsQuery } from '@linode/queries';

interface DNSResolversProps {
  region: string;
}

export const DNSResolvers = React.memo((props: DNSResolversProps) => {
  const { region } = props;
  const theme = useTheme();
  const regions = useRegionsQuery().data ?? [];

  const linodeRegion = regions.find((thisRegion) => thisRegion.id === region);

  const v4Resolvers = linodeRegion?.resolvers?.ipv4.split(',') ?? [];
  const v6Resolvers = linodeRegion?.resolvers?.ipv6.split(',') ?? [];

  const renderIPResolvers = (resolvers: string[]) => {
    return resolvers.map((thisAddress) => (
      <Typography
        sx={{
          lineHeight: 1.43,
        }}
        key={`ip-resolver-item-${thisAddress}`}
      >
        {thisAddress}
      </Typography>
    ));
  };

  return (
    <Grid
      sx={{
        display: 'grid',
        gridTemplateAreas: `
            'one one'
            'two three'
          `,
        overflowX: 'auto',
        [theme.breakpoints.down('sm')]: {
          flex: 1,
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}
      container
    >
      <Grid
        sx={{
          gridArea: 'one',
          paddingBottom: 0,
          paddingTop: 0,
        }}
        size={12}
      >
        <Typography>
          <strong>DNS Resolvers</strong>
        </Typography>
      </Grid>
      <Grid
        sx={{
          gridArea: 'two',
          paddingRight: theme.spacing(2),
        }}
        size="auto"
      >
        {renderIPResolvers(v4Resolvers)}
      </Grid>
      <Grid
        sx={{
          gridArea: 'three',
          paddingLeft: theme.spacing(2),
        }}
        size="auto"
      >
        {renderIPResolvers(v6Resolvers)}
      </Grid>
    </Grid>
  );
});
