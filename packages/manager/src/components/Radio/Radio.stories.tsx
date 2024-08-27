import React from 'react';

import { Box } from 'src/components/Box';

import { FormControlLabel } from '../FormControlLabel';
import { RadioGroup } from '../RadioGroup';
import { Radio } from './Radio';

import type { RadioProps } from './Radio';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<RadioProps> = {
  args: {
    defaultChecked: false,
    disableFocusRipple: false,
    disableRipple: false,
    disableTouchRipple: false,
    disabled: false,
    name: 'radio',
    readOnly: false,
  },
  component: Radio,
  decorators: [
    (Story) => (
      <Box sx={{ padding: 4 }}>
        <Story />
      </Box>
    ),
  ],
  title: 'Foundations/Radio',
};

type Story = StoryObj<RadioProps>;

export const Default: Story = {
  render: (args: RadioProps) => <Radio {...args} />,
};

export const Groups: Story = {
  name: 'Controlled Radio Groups',
  render: () => (
    <RadioGroup>
      <FormControlLabel
        control={<Radio checked={false} disabled />}
        label="Disabled"
      />
      <FormControlLabel control={<Radio />} label="Option 1" value="Option 1" />
      <FormControlLabel control={<Radio />} label="Option 2" value="Option 2" />
    </RadioGroup>
  ),
};

export default meta;
