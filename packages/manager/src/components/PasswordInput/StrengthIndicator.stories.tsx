import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { StrengthIndicator } from './StrengthIndicator';

const meta: Meta<typeof StrengthIndicator> = {
  component: StrengthIndicator,
  title: 'Components/Strength Indicator',
};

type Story = StoryObj<typeof StrengthIndicator>;

export const Default: Story = {
  render: (args) => <StrengthIndicator {...args} />,
};

export default meta;
