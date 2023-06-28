import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
};

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => <Checkbox {...args} />,
};

export const Checked: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    checked: true,
  },
};

export const Unchecked: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    checked: false,
  },
};

export const Label: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    text: 'This Checkbox has a label',
  },
};

export const Tooltip: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    toolTipText: 'This is the tooltip!',
  },
};

export const LabelAndTooltip: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    text: 'This Checkbox has a tooltip',
    toolTipText: 'This is the tooltip!',
  },
};

export default meta;
