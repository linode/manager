import * as React from 'react';
import { compose } from 'recompose';
import Grid from '@mui/material/Unstable_Grid2';
import { withLinodeDetailContext } from 'src/features/Linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs';

type CombinedProps = LinodeContextProps;

const LinodeAdvancedConfigurationsPanel: React.FC<CombinedProps> = () => {
  return (
    <Grid container className="m0" xs={12} spacing={1}>
      <Grid
        sx={{
          padding: 0,
          flex: 1,
        }}
      >
        <LinodeConfigs />
      </Grid>
    </Grid>
  );
};

interface LinodeContextProps {
  linodeID: number;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id,
}));

const enhanced = compose<CombinedProps, {}>(linodeContext);

export default enhanced(LinodeAdvancedConfigurationsPanel);
