/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import PasswordInput from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
  title: 'Components/Password Input',
};

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <PasswordInput
        {...args}
        value={args.value ?? value}
        onChange={(e) => {
          if (args.onChange) {
            args.onChange(e);
          }
          setValue(e.target.value);
        }}
      />
    );
  },
};

export default meta;
