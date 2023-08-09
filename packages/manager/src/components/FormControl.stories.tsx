import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { FormControl } from './FormControl';
import { FormHelperText } from './FormHelperText';
import { Input } from './Input';
import { InputLabel } from './InputLabel';

const meta: Meta<typeof FormControl> = {
  component: FormControl,
  title: 'Components/Form/FormControl',
};

type Story = StoryObj<typeof FormControl>;

export const Default: Story = {
  args: {
    children: (
      <>
        <InputLabel htmlFor="my-input" sx={{ padding: 0, transform: 'none' }}>
          Email address
        </InputLabel>
        <Input />
        <FormHelperText id="my-helper-text" sx={{ marginX: 0 }}>
          We never share your email.
        </FormHelperText>
      </>
    ),
  },
  render: (args) => <FormControl {...args} />,
};

export default meta;
