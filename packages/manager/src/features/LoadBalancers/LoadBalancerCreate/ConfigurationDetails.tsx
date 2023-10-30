import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

export const ConfigurationDetails = () => {
  return (
    <Stack spacing={1}>
      <Grid>
        <Typography variant="h2">Details</Typography>
        <Typography sx={(theme) => ({ marginRight: theme.spacing(1) })}>
          The port the load balancer listens on, and the protocol for routing
          incoming traffic to the targets.
        </Typography>
      </Grid>
      <Grid container>
        <Autocomplete
          onChange={(_, selection) => {
            //   handleFirewallChange(selection?.value ?? -1);
          }}
          errorText={''}
          label="Protocol"
          noOptionsText="No Protocols available"
          options={[]}
          sx={(theme) => ({ marginRight: theme.spacing(2) })}
          //   value={''}
        />
        <TextField
          errorText={''}
          label="Port"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => null}
          sx={{ maxWidth: '60px' }}
          tooltipText="tbd"
          value={''}
        />
      </Grid>
      <Grid>
        <Typography variant="h3">TLS Certificates</Typography>
        <Typography>
          Upload and apply downstream Certificate after LB provisioning Learn
          more.
        </Typography>
      </Grid>
      <TextField
        errorText={''}
        label="Configuration Label"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => null}
        tooltipText="tbd"
        value={''}
      />
    </Stack>
  );
};
