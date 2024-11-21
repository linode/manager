import React from 'react';

import { Tooltip } from './Tooltip';

import type { Meta, StoryObj } from '@storybook/react';
// @todo: modularization - Import from 'ui' package once Typography is migrated.
import { Typography } from '@mui/material';

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
