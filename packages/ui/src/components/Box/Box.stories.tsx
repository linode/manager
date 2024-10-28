import React from 'react';

import { Box } from './Box';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Box> = {
  component: Box,
  title: 'Foundations/Box',
};

type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    border: 1,
    children: 'This is text within a Box',
  },
  render: (args) => <Box {...args} />,
};

export default meta;
