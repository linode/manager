import { Checkbox, Radio, Toggle } from '@linode/ui';
import React from 'react';

import { FormControlLabel } from './FormControlLabel';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FormControlLabel> = {
  component: FormControlLabel,
  title: 'Components/Form/FormControlLabel',
};

type Story = StoryObj<typeof FormControlLabel>;

export const Default: Story = {
  argTypes: {
    control: {
      mapping: {
        Checkbox: <Checkbox />,
        Radio: <Radio />,
        Toggle: <Toggle />,
      },
      options: ['Checkbox', 'Radio', 'Toggle'],
    },
  },
  args: {
    control: <Checkbox />,
    label: 'This is a FormControlLabel',
  },
  render: (args) => <FormControlLabel {...args} />,
};

export default meta;
