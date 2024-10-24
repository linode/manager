import React from 'react';

import { VisibilityTooltip } from './VisibilityTooltip';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof VisibilityTooltip> = {
  component: VisibilityTooltip,
  title: 'Components/VisibilityTooltip',
};

type Story = StoryObj<typeof VisibilityTooltip>;

export const Default: Story = {
  args: {
    isVisible: true,
  },
  render: (args) => <VisibilityTooltip {...args} />,
};

export default meta;
