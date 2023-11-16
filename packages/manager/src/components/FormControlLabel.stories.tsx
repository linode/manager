import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Checkbox } from './Checkbox';
import { FormControlLabel } from './FormControlLabel';
import { Radio } from './Radio/Radio';
import { Toggle } from './Toggle/Toggle';

const meta: Meta<typeof FormControlLabel> = {
  component: FormControlLabel,
  title: 'Components/Form/FormControlLabel',
};

const controlOptions = {
  Checkbox: <Checkbox />,
  Radio: <Radio />,
  Toggle: <Toggle />,
};

type Story = StoryObj<typeof FormControlLabel>;

export const Default: Story = {
  argTypes: {
    control: {
      options: controlOptions,
    },
  },
  args: {
    control: controlOptions.Checkbox,
    label: 'This is a FormControlLabel',
  },
  render: (args) => <FormControlLabel {...args} />,
};

export default meta;
