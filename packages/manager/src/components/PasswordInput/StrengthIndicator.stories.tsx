import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { StrengthIndicator } from './StrengthIndicator';

const meta: Meta<typeof StrengthIndicator> = {
  title: 'Components/Strength Indicator',
  component: StrengthIndicator,
};

type Story = StoryObj<typeof StrengthIndicator>;

export const Default: Story = {
  render: (args) => <StrengthIndicator {...args} />,
};

export default meta;
