import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import FormControlLabel from '../core/FormControlLabel';
import RadioGroup from '../core/RadioGroup';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
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
