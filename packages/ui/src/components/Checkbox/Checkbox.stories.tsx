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

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  render: (args) => <Checkbox {...args} />,
};

export const WithLabel: Story = {
  args: {
    text: 'This Checkbox has a label',
  },
  render: (args) => <Checkbox {...args} />,
};

export const WithTooltip: Story = {
  args: {
    toolTipText: 'This is the tooltip!',
  },
  render: (args) => <Checkbox {...args} />,
};

export const WithLabelAndTooltip: Story = {
  args: {
    text: 'This Checkbox has a tooltip',
    toolTipText: 'This is the tooltip!',
  },
  render: (args) => <Checkbox {...args} />,
};

// @todo: Akamai Design System
// export const Focused: Story = {
//   render: (args) => <Checkbox {...args} />,
// };

// @todo: Akamai Design System
// export const ReadOnly: Story = {
//   args: {
//     readOnly: true,
//   },
//   render: (args) => <Checkbox {...args} />,
// };

// @todo: Akamai Design System
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

export default meta;
