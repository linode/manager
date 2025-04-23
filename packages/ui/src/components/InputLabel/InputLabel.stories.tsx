import React from 'react';

import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { InputLabel } from './InputLabel';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InputLabel> = {
  component: InputLabel,
  title: 'Components/Input/InputLabel',
};

type Story = StoryObj<typeof InputLabel>;

export const Default: Story = {
  args: {
    children: 'Phone Number',
    sx: { transform: 'none' },
  },
  render: (args) => (
    <FormControl>
      <InputLabel {...args} />
      <Input />
    </FormControl>
  ),
};

export default meta;
