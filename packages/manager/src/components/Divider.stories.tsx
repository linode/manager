import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Divider } from 'src/components/Divider';

const meta: Meta<typeof Divider> = {
  component: Divider,
  title: 'Components/Divider',
};

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: (args) => <Divider {...args} />,
};

export default meta;
