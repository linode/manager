import { Linode } from '@linode/api-v4/lib/linodes';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { Link } from 'react-router-dom';

import { Typography } from 'src/components/Typography';

import { LinodeSelect } from './LinodeSelect';

import type {
  LinodeMultiSelectProps,
  LinodeSingleSelectProps,
} from './LinodeSelect';
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
  title: 'Components/Linode Select',
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
    noOptionsMessage: (
      <Typography>
        You have no VPCs. Go to{' '}
        <Link data-testid="abuse-ticket-link" to={'/linodes'}>
          VPC
        </Link>{' '}
        to create one. Any data you have entered will be lost leaving this page.
      </Typography>
    ),
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
