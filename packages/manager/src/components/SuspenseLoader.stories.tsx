import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { SuspenseLoader } from './SuspenseLoader';

const meta: Meta<typeof SuspenseLoader> = {
  component: SuspenseLoader,
  title: 'Components/Loading States/Suspense Loader',
};

type Story = StoryObj<typeof SuspenseLoader>;

export const Default: Story = {
  render: (args) => <SuspenseLoader {...args} />,
};

export default meta;
