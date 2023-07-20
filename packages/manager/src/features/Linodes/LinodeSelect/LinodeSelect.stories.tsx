import { action } from '@storybook/addon-actions';
import React from 'react';

import { LinodeSelect } from './LinodeSelect';

import type {
  LinodeMultiSelectProps,
  LinodeSingleSelectProps,
} from './LinodeSelect';
import type { Meta, StoryObj } from '@storybook/react';

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
  args: {},
  render: (args) => <LinodeSelect {...args} />,
};

/* Linode Multi-select */
export const MultiSelect: Story = {
  args: {},
  render: (args) => <LinodeSelect {...args} />,
};
