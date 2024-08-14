import React from 'react';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof CheckoutBar>;

export const Default: Story = {
  args: {
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
  },
  render: (args) => <CheckoutBar {...args} />,
};

const meta: Meta<typeof CheckoutBar> = {
  component: CheckoutBar,
  title: 'Components/CheckoutBar',
};

export default meta;
