/* eslint-disable react-hooks/rules-of-hooks */
import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { HideShowText } from './HideShowText';

const meta: Meta<typeof HideShowText> = {
  title: 'Components/Hide Show Text',
  component: HideShowText,
};

type Story = StoryObj<typeof HideShowText>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <HideShowText
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
