import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { TextField } from 'src/components/TextField';
//import { IPSelect } from 'src/components/IPSelect/IPSelect';

export const SubnetNode = () => {
  return (
    <Grid>
      <TextField 
        label="Subnet label"
      />
      <TextField // TODO CONNIE -- ip select? + dividers / labels depending on index?
        label="Subnet IP Range Address"
      />
    </Grid>
  );
}