import { FormControl, RadioGroup } from '@linode/ui';
import React from 'react';

import { FormControlLabel } from './FormControlLabel';
import { FormLabel } from './FormLabel';
import { Radio } from './Radio/Radio';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FormLabel> = {
  component: FormLabel,
  title: 'Components/Form/FormLabel',
};

type Story = StoryObj<typeof FormLabel>;

export const Default: Story = {
  args: {
    children: 'Theme',
  },
  render: (args) => (
    <FormControl>
      <FormLabel {...args} />
      <RadioGroup row>
        <FormControlLabel control={<Radio />} label="Light" value="light" />
        <FormControlLabel control={<Radio />} label="Dark" value="dark" />
        <FormControlLabel control={<Radio />} label="System" value="system" />
      </RadioGroup>
    </FormControl>
  ),
};

export default meta;
