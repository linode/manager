import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Typography } from './Typography';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
};

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => <Tooltip {...args} />,
  args: {
    title: 'This is a Tooltip',
    children: <Typography component="span">Hover to see Tooltip</Typography>,
  },
};

export default meta;
