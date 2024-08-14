import React from 'react';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CheckoutBar> = {
  component: CheckoutBar,
  title: 'Components/CheckoutBar',
};

type Story = StoryObj<typeof CheckoutBar>;

export const Default: Story = {
  args: {
    calculatedPrice: 30.0,
    children: (
      <div>
        <i style={{ color: 'white' }}>Children items can go here!</i>
      </div>
    ),
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
    submitText: 'Submit',
  },
  render: (args) => <CheckoutBar {...args} />,
};

export const WithAgreement: Story = {
  args: {
    ...Default.args,
    agreement: (
      <div>
        <i style={{ color: 'white' }}>Agreement item can go here</i>
      </div>
    ),
  },
  render: (args) => <CheckoutBar {...args} />,
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: (args) => <CheckoutBar {...args} />,
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isMakingRequest: true,
  },
  render: (args) => <CheckoutBar {...args} />,
};

export default meta;
