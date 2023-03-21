import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

interface Props {
  onChange: () => void;
  networkHelperEnabled: boolean;
}

const NetworkHelper = ({ onChange, networkHelperEnabled }: Props) => {
  return (
    <Accordion heading="Network Helper" defaultExpanded={true}>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="body1">
            Network Helper automatically deposits a static networking
            configuration into your Linode at boot.
          </Typography>
        </Grid>
        <Grid item container direction="row" alignItems="center">
          <Grid item>
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
