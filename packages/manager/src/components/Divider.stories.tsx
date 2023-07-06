import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Divider } from 'src/components/Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
};

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: (args) => <Divider {...args} />,
};

export default meta;
