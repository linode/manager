import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { useRegionsQuery } from 'src/queries/regions';

interface DNSResolversProps {
  region: string;
}

export const DNSResolvers = (props: DNSResolversProps) => {
  const { region } = props;
  const theme = useTheme();
  const regions = useRegionsQuery().data ?? [];

  const linodeRegion = regions.find((thisRegion) => thisRegion.id === region);

  const v4Resolvers = linodeRegion?.resolvers?.ipv4.split(',') ?? [];
  const v6Resolvers = linodeRegion?.resolvers?.ipv6.split(',') ?? [];

  const renderIPResolvers = (resolvers: string[]) => {
    return resolvers.map((thisAddress) => (
      <Typography
        key={`ip-resolver-item-${thisAddress}`}
        sx={{
          lineHeight: 1.43,
        }}
      >
        {thisAddress}
      </Typography>
    ));
  };

  return (
    <Grid
      container
      sx={{
        display: 'grid',
        overflowX: 'auto',
        gridTemplateAreas: `
            'one one'
            'two three'
          `,
        [theme.breakpoints.down('sm')]: {
          flex: 1,
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}
    >
      <Grid
        xs={12}
        sx={{
          paddingTop: 0,
          paddingBottom: 0,
          gridArea: 'one',
        }}
      >
        <Typography>
          <strong>DNS Resolvers</strong>
        </Typography>
      </Grid>
      <Grid
        xs="auto"
        sx={{
          gridArea: 'two',
          paddingRight: theme.spacing(2),
        }}
      >
        {renderIPResolvers(v4Resolvers)}
      </Grid>
      <Grid
        xs="auto"
        sx={{
          gridArea: 'three',
          paddingLeft: theme.spacing(2),
        }}
      >
        {renderIPResolvers(v6Resolvers)}
      </Grid>
    </Grid>
  );
};

export default React.memo(DNSResolvers);
