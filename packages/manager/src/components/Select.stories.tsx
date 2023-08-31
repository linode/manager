import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { MenuItem } from './MenuItem';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Components/Select',
};

type Story = StoryObj<typeof Select>;

const children = [
  <MenuItem key="10" value={10}>
    Ten
  </MenuItem>,
  <MenuItem key="20" value={20}>
    Twenty
  </MenuItem>,
  <MenuItem key="30" value={30}>
    Thirty
  </MenuItem>,
];

export const Default: Story = {
  args: {
    children,
    label: 'Select',
  },
  render: (args) => <Select {...args} />,
};

export const Error: Story = {
  args: {
    children,
    errorText: 'The option you selected is invalid.',
    label: 'Select',
  },
  render: (args) => <Select {...args} />,
};

export const HelperText: Story = {
  args: {
    children,
    helperText: 'Select an option to see more.',
    label: 'Select',
  },
  render: (args) => <Select {...args} />,
};

export default meta;
