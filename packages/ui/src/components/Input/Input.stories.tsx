import React from 'react';

import { Input } from './Input';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Components/Input',
};

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: (args) => <Input {...args} />,
};

export default meta;
