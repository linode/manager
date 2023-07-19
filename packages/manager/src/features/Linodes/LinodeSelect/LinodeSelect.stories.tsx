import { action } from '@storybook/addon-actions';
import React from 'react';

import { LinodeSelectV2 } from './LinodeSelectV2';

import type {
  LinodeMultiSelectProps,
  LinodeSingleSelectProps,
} from './LinodeSelectV2';
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
  component: LinodeSelectV2,
  title: 'Components/Linode Select',
};

export default meta;

type Story = StoryObj<typeof LinodeSelectV2>;

/** Default Linode Select */
export const Default: Story = {
  args: {},
  render: (args) => <LinodeSelectV2 {...args} />,
};

/* Linode Multi-select */
export const MultiSelect: Story = {
  args: {},
  render: (args) => <LinodeSelectV2 {...args} />,
};
