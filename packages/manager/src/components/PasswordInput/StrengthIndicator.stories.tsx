import React from 'react';

import { StrengthIndicator } from './StrengthIndicator';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StrengthIndicator> = {
  component: StrengthIndicator,
  title: 'Components/Strength Indicator',
};

type Story = StoryObj<typeof StrengthIndicator>;

export const Default: Story = {
  render: (args) => <StrengthIndicator {...args} />,
};

export default meta;
