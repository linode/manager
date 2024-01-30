import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { InputAdornment } from './InputAdornment';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  component: TextField,
  title: 'Components/TextField',
};

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Label',
    noMarginTop: true,
    placeholder: 'Placeholder',
  },
  render: (args) => <TextField {...args} />,
};

export const Error: Story = {
  args: {
    errorText: 'This input needs further attention!',
    label: 'Label for Error',
    noMarginTop: true,
  },
  render: (args) => <TextField {...args} />,
};

export const Number: Story = {
  args: {
    label: 'Label for Number',
    noMarginTop: true,
    type: 'number',
  },
  render: (args) => <TextField {...args} />,
};

export const WithTooltip: Story = {
  args: {
    label: 'Label',
    labelTooltipText: 'Tooltip Text',
    noMarginTop: true,
    placeholder: 'Placeholder',
  },
  render: (args) => <TextField {...args} />,
};

export const WithAdornment: Story = {
  args: {
    InputProps: {
      startAdornment: <InputAdornment position="end">$</InputAdornment>,
    },
    label: 'Label with an InputAdornment',
    noMarginTop: true,
    type: 'number',
  },
  render: (args) => <TextField {...args} />,
};

export default meta;
