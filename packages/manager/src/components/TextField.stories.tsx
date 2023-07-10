import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
};

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  render: (args) => <TextField {...args} />,
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    noMarginTop: true,
  },
};

export const Error: Story = {
  render: (args) => <TextField {...args} />,
  args: {
    label: 'Label for Error',
    errorText: 'This input needs further attention!',
    noMarginTop: true,
  },
};

export const Number: Story = {
  render: (args) => <TextField {...args} />,
  args: {
    type: 'number',
    label: 'Label for Number',
    noMarginTop: true,
  },
};

export default meta;
