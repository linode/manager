import React from 'react';

import { SuspenseLoader } from './SuspenseLoader';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SuspenseLoader> = {
  component: SuspenseLoader,
  title: 'Components/Loading States/Suspense Loader',
};

type Story = StoryObj<typeof SuspenseLoader>;

export const Default: Story = {
  render: (args) => <SuspenseLoader {...args} />,
};

export default meta;
