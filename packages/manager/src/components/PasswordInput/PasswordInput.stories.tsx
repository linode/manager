/* eslint-disable react-hooks/rules-of-hooks */
import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

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
        onChange={(e) => {
          if (args.onChange) {
            args.onChange(e);
          }
          setValue(e.target.value);
        }}
        value={args.value ?? value}
      />
    );
  },
};

export default meta;
