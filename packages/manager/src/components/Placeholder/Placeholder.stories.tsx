import React from 'react';

import { Placeholder } from './Placeholder';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof Placeholder>;

export const Default: Story = {
  args: {
    additionalCopy: 'This is some additional text',
    showTransferDisplay: true,
    subtitle: 'Placeholder subtitle',
    title: 'Placeholder title',
  },
  render: (args) => <Placeholder {...args} />,
};

const meta: Meta<typeof Placeholder> = {
  component: Placeholder,
  title: 'Features/Entity Landing Page/Placeholders',
};

export default meta;
