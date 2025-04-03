import React from 'react';

import { NewFeatureChip } from './NewFeatureChip';

import type { NewFeatureChipProps } from './NewFeatureChip';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<NewFeatureChipProps> = {
  render: (args) => <NewFeatureChip {...args} />,
};

const meta: Meta<NewFeatureChipProps> = {
  args: { color: 'default' },
  component: NewFeatureChip,
  title: 'Foundations/Chip/NewFeatureChip',
};
export default meta;
