import React from 'react';

import { BetaChip } from './BetaChip';

import type { BetaChipProps } from './BetaChip';
import type { Meta, StoryObj } from '@storybook/react-vite';

export const Default: StoryObj<BetaChipProps> = {
  render: (args) => <BetaChip {...args} />,
};

const meta: Meta<BetaChipProps> = {
  args: {},
  component: BetaChip,
  title: 'Foundations/Chip/BetaChip',
};
export default meta;
