import * as React from 'react';
import Grid from 'src/components/Grid';
import HelpIcon from './HelpIcon';

export default {
  title: 'UI Elements/Tooltip/Help Icon',
};

export const Default = () => (
  <HelpIcon text="There is some help text! Yada, yada, yada..." />
);

Default.story = {
  name: 'default',
};

export const Center = () => (
  <Grid container justifyContent="center">
    <Grid item>
      <HelpIcon text="There is some help text! Yada, yada, yada..." />
    </Grid>
  </Grid>
);

Center.story = {
  name: 'center',
};

export const Left = () => (
  <Grid container justifyContent="flex-start">
    <Grid item>
      <HelpIcon text="There is some help text! Yada, yada, yada..." />
    </Grid>
  </Grid>
);

Left.story = {
  name: 'left',
};

export const Right = () => (
  <Grid container justifyContent="flex-end">
    <Grid item>
      <HelpIcon text="There is some help text! Yada, yada, yada..." />
    </Grid>
  </Grid>
);

Right.story = {
  name: 'right',
};
