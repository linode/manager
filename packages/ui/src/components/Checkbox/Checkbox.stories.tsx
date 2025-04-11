import React from 'react';

import { Box } from '../Box';
import { Checkbox } from './Checkbox';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  decorators: [
    (Story: StoryFn) => (
      <Box sx={(theme) => ({ margin: theme.tokens.spacing.S16 })}>
        <Story />
      </Box>
    ),
  ],
  title: 'Foundations/Checkbox',
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  argTypes: {
    text: {
      control: {
        type: 'text',
      },
    },
    toolTipText: {
      control: {
        type: 'text',
      },
    },
  },
  args: {
    checked: false,
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const UncheckedDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const CheckedDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const IndeterminateDisabled: Story = {
  args: {
    indeterminate: true,
    disabled: true,
  },
};

export const UncheckedReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const CheckedReadOnly: Story = {
  args: {
    readOnly: true,
    checked: true,
  },
};

export const IndeterminateReadOnly: Story = {
  args: {
    readOnly: true,
    indeterminate: true,
  },
};

export const WithLabel: Story = {
  args: {
    text: 'This Checkbox has a label',
  },
};

export const WithTooltip: Story = {
  args: {
    toolTipText: 'This is the tooltip!',
  },
};

export const WithLabelAndTooltip: Story = {
  args: {
    text: 'This Checkbox has a tooltip',
    toolTipText: 'This is the tooltip!',
  },
};

export const SmallSize: Story = {
  args: {
    customSize: 'sm',
  },
};
