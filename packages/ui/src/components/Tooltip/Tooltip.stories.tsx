import React from 'react';

import { Typography } from '../Typography';
import { Tooltip } from './Tooltip';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'Components/Tooltip',
};

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    children: <Typography component="span">Hover to see Tooltip</Typography>,
    title: 'This is a Tooltip',
  },
  render: (args) => <Tooltip {...args} />,
};

export default meta;
