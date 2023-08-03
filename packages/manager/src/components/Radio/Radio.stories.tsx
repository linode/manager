import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { FormControlLabel } from '../FormControlLabel';
import { RadioGroup } from '../RadioGroup';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Components/Radio',
};

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: (args) => <Radio {...args} />,
};

export const Controlled: Story = {
  name: 'Controlled Radio',
  render: (args) => (
    <FormControlLabel control={<Radio {...args} />} label="Radio Label" />
  ),
};

export const Groups: Story = {
  name: 'Radio Groups',
  render: () => (
    <RadioGroup>
      <FormControlLabel control={<Radio disabled />} label="Disabled" />
      <FormControlLabel control={<Radio />} label="Default" />
    </RadioGroup>
  ),
};

export default meta;
