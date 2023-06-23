import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import FormControlLabel from '../core/FormControlLabel';
import RadioGroup from '../core/RadioGroup';

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
    <FormControlLabel label="Radio Label" control={<Radio {...args} />} />
  ),
};

export const Groups: Story = {
  name: 'Radio Groups',
  render: () => (
    <RadioGroup>
      <FormControlLabel label="Disabled" control={<Radio disabled />} />
      <FormControlLabel label="Default" control={<Radio />} />
    </RadioGroup>
  ),
};

export default meta;
