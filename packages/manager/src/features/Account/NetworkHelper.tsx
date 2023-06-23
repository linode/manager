import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';
import Grid from '@mui/material/Unstable_Grid2';
import { Toggle } from 'src/components/Toggle';

interface Props {
  onChange: () => void;
  networkHelperEnabled: boolean;
}

const NetworkHelper = ({ networkHelperEnabled, onChange }: Props) => {
  return (
    <Accordion heading="Network Helper" defaultExpanded={true}>
      <Grid container direction="column" spacing={2}>
        <Grid>
          <Typography variant="body1">
            Network Helper automatically deposits a static networking
            configuration into your Linode at boot.
          </Typography>
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid>
            <FormControlLabel
              control={
                <Toggle
                  onChange={onChange}
                  checked={networkHelperEnabled}
                  data-qa-toggle-network-helper
                />
              }
              label={
                networkHelperEnabled ? 'Enabled (default behavior)' : 'Disabled'
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Accordion>
  );
};

export default NetworkHelper;
