import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Flag } from './Flag';

const meta: Meta<typeof Flag> = {
  title: 'Components/Flag',
  component: Flag,
};

type Story = StoryObj<typeof Flag>;

export const Default: Story = {
  render: (args) => <Flag {...args} />,
  args: {
    country: 'us',
  },
};

export default meta;
