import * as React from 'react';

import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';

export const LongviewClientHeader: React.FC<{}> = props => {
  return (
    <Grid
      container
      item
      direction="column"
      spacing={2}
      style={{ paddingTop: '8px', paddingLeft: '16px' }}
    >
      <Grid
        container
        item
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item>
          <EntityIcon status="running" variant="linode" />
        </Grid>
        <Grid item>
          <Typography>
            <strong>Dev Server 1</strong>
          </Typography>
          <Typography>dev.hostname.com</Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Typography>Up 47d 19h 22m</Typography>
        <Typography>2 packages have updates</Typography>
      </Grid>
      <Grid item>
        <Button onClick={() => null} buttonType="secondary">
          View details
        </Button>
      </Grid>
    </Grid>
  );
};

export default LongviewClientHeader;
