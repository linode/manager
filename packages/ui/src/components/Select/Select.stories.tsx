import React from 'react';

import { Select } from './Select';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Components/Selects/Select',
};

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'A Select with a couple options',
    options: [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
    ],
  },
  render: (args) => <Select {...args} />,
};

export default meta;
