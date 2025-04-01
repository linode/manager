import { action } from '@storybook/addon-actions';
import React from 'react';

import { LinodeSelect } from './LinodeSelect';

import type {
  LinodeMultiSelectProps,
  LinodeSingleSelectProps,
} from './LinodeSelect';
import type { Linode } from '@linode/api-v4/lib/linodes';
import type { Meta, StoryObj } from '@storybook/react';

const linodes = [
  { id: 1, label: 'Linode 1' },
  { id: 2, label: 'Linode 2' },
  { id: 3, label: 'Linode 3' },
  { id: 4, label: 'Linode 4' },
];

const meta: Meta<LinodeMultiSelectProps | LinodeSingleSelectProps> = {
  argTypes: {
    onSelectionChange: {
      action: 'onSelectionChange',
    },
  },
  args: {
    onSelectionChange: action('onSelectionChange'),
  },
  component: LinodeSelect,
  title: 'Components/Selects/Linode Select',
};

export default meta;

type Story = StoryObj<typeof LinodeSelect>;

/** Default Linode Select */
export const Default: Story = {
  args: {
    options: linodes as Linode[],
  },
  render: (args) => <LinodeSelect {...args} />,
};

export const noOptionsMessage: Story = {
  args: {
    label: 'Select a Linode',
    noOptionsMessage:
      'This is a custom message when there are no options to display.',
    options: [],
    placeholder: 'Select a Linode',
    value: null,
  },
  render: (args) => <LinodeSelect {...args} />,
};

/* Linode Multi-select */
export const MultiSelect: Story = {
  args: {
    multiple: true,
    onSelectionChange: (selected) => {
      action('onSelectionChange')(selected.map((linode) => linode.id));
    },
    value: [1, 2],
  },
  render: (args) => <LinodeSelect {...args} />,
};
