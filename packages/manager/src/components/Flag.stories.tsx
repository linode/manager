import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Flag } from './Flag';

const meta: Meta<typeof Flag> = {
  component: Flag,
  title: 'Components/Flag',
};

type Story = StoryObj<typeof Flag>;

export const Default: Story = {
  args: {
    country: 'US',
  },
  render: (args) => <Flag {...args} />,
};

export default meta;
