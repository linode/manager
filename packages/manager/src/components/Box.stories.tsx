import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
};

type Story = StoryObj<typeof Box>;

export const Default: Story = {
  render: (args) => <Box {...args} />,
  args: {
    children: 'This is text within a Box',
    border: 1,
  },
};

export default meta;
