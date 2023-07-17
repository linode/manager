import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Box } from './Box';

const meta: Meta<typeof Box> = {
  component: Box,
  title: 'Components/Box',
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
