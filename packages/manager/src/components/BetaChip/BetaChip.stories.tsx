import React from 'react';

import { BetaChip } from './BetaChip';

import type { BetaChipProps } from './BetaChip';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<BetaChipProps> = {
  render: (args) => <BetaChip {...args} />,
};

const meta: Meta<BetaChipProps> = {
  args: { color: 'default' },
  component: BetaChip,
  title: 'Foundations/Chip/BetaChip',
};
export default meta;
