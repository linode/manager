import React from 'react';

import { Input } from '../Input';
import { InputAdornment } from './InputAdornment';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InputAdornment> = {
  component: InputAdornment,
  title: 'Components/Input/InputAdornment',
};

type Story = StoryObj<typeof InputAdornment>;

export const Default: Story = {
  args: {
    children: '$',
    position: 'end',
  },
  render: (args) => <Input startAdornment={<InputAdornment {...args} />} />,
};

export const StartAdornment: Story = {
  args: {
    children: '$',
    position: 'end',
  },
  render: (args) => <Input startAdornment={<InputAdornment {...args} />} />,
};

export const EndAdornment: Story = {
  args: {
    children: '%',
    position: 'end',
  },
  render: (args) => <Input endAdornment={<InputAdornment {...args} />} />,
};

export default meta;
