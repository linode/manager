import React from 'react';

import { Checkbox } from './Checkbox';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Foundations/Checkbox',
};

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
  render: (args) => <Checkbox {...args} />,
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => <Checkbox {...args} />,
};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
  render: (args) => <Checkbox {...args} />,
};

export const Label: Story = {
  args: {
    text: 'This Checkbox has a label',
  },
  render: (args) => <Checkbox {...args} />,
};

export const Tooltip: Story = {
  args: {
    toolTipText: 'This is the tooltip!',
  },
  render: (args) => <Checkbox {...args} />,
};

export const LabelAndTooltip: Story = {
  args: {
    text: 'This Checkbox has a tooltip',
    toolTipText: 'This is the tooltip!',
  },
  render: (args) => <Checkbox {...args} />,
};

export default meta;
