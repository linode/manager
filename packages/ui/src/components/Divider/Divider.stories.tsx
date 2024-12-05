import React from 'react';

import { Divider } from './Divider';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Divider> = {
  component: Divider,
  title: 'Foundations/Divider',
};

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    absolute: false,
    light: true,
    variant: 'inset',
  },

  render: (args) => <Divider {...args} />,
};

export default meta;
