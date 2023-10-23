import React from 'react';

import { Box } from './Box';
import { Button } from './Button/Button';
import { Paper } from './Paper';
import { Spacer } from './Spacer';
import { StatusIcon } from './StatusIcon/StatusIcon';
import { Typography } from './Typography';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof Spacer> = {
  render: () => (
    <Box display="flex">
      <Paper variant="outlined">1</Paper>
      <Spacer />
      <Paper variant="outlined">2</Paper>
    </Box>
  ),
};

export const Example: StoryObj<typeof Spacer> = {
  render: () => (
    <Box alignItems="center" display="flex">
      <Typography variant="h2">Linode</Typography>
      <StatusIcon ml={1} status="active" />
      <Spacer />
      <Button buttonType="primary">Create Linode</Button>
    </Box>
  ),
};

const meta: Meta<typeof Spacer> = {
  component: Spacer,
  title: 'Components/Spacer',
};

export default meta;
