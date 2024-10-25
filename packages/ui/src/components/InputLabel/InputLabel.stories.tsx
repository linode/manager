import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { FormControl } from '../FormControl/FormControl';
import { Input } from '../Input/Input';
import { InputLabel } from './InputLabel';

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
