import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type {
  LinodeMultiSelectProps,
  LinodeSingleSelectProps,
} from './LinodeSelectV2';
import { LinodeSelectV2 } from './LinodeSelectV2';
import { action } from '@storybook/addon-actions';

const meta: Meta<LinodeSingleSelectProps | LinodeMultiSelectProps> = {
  title: 'Components/Linode Select',
  component: LinodeSelectV2,
  argTypes: {
    onSelectionChange: {
      action: 'onSelectionChange',
    },
  },
  args: {
    onSelectionChange: action('onSelectionChange'),
  },
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
