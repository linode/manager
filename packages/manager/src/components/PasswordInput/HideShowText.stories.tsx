/* eslint-disable react-hooks/rules-of-hooks */
import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { HideShowText } from './HideShowText';

const meta: Meta<typeof HideShowText> = {
  component: HideShowText,
  title: 'Components/Hide Show Text',
};

type Story = StoryObj<typeof HideShowText>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <HideShowText
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
