import React from 'react';

import { Divider } from '../Divider';
import { Paper } from '../Paper';
import { Stack } from './Stack';

import type { Meta, StoryObj } from '@storybook/react';

const children = [
  <Paper key={0} variant="outlined">
    1
  </Paper>,
  <Paper key={1} variant="outlined">
    2
  </Paper>,
  <Paper key={2} variant="outlined">
    3
  </Paper>,
];

export const Default: StoryObj<typeof Stack> = {
  args: {
    children,
    spacing: 2,
  },
  render: (args) => <Stack {...args} />,
};

export const Vertical: StoryObj<typeof Stack> = {
  args: {
    children,
    spacing: 2,
  },
  render: (args) => <Stack {...args} />,
};

export const Horizontal: StoryObj<typeof Stack> = {
  args: {
    children,
    direction: 'row',
    spacing: 2,
  },
  render: (args) => <Stack {...args} />,
};

export const WithDivider: StoryObj<typeof Stack> = {
  args: {
    children,
    direction: 'row',
    divider: <Divider flexItem orientation="vertical" />,
    spacing: 2,
  },
  render: (args) => <Stack {...args} />,
};

const meta: Meta<typeof Stack> = {
  component: Stack,
  title: 'Foundations/Stack',
};

export default meta;
