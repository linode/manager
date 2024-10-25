import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { FormControl } from '../FormControl/FormControl';
import { FormHelperText } from './FormHelperText';
import { Input } from '../Input/Input';
import { InputLabel } from '../InputLabel/InputLabel';

const meta: Meta<typeof FormHelperText> = {
  component: FormHelperText,
  title: 'Components/Form/FormHelperText',
};

type Story = StoryObj<typeof FormHelperText>;

export const Default: Story = {
  args: {
    children: 'Your label must be unique',
    sx: { marginX: 0 },
  },
  render: (args) => (
    <FormControl>
      <InputLabel sx={{ transform: 'none' }}>Label</InputLabel>
      <Input />
      <FormHelperText {...args} />
    </FormControl>
  ),
};

export default meta;
