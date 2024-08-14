import React from 'react';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof CheckoutBar> = {
  component: CheckoutBar,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/CheckoutBar',
};

type Story = StoryObj<typeof CheckoutBar>;

const Item = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: 'white', fontStyle: 'italic' }}>{children}</div>
);

export const Default: Story = {
  args: {
    calculatedPrice: 30.0,
    children: <Item>Child items can go here!</Item>,
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
    submitText: 'Submit',
  },
  render: (args) => <CheckoutBar {...args} />,
};

export const WithAgreement: Story = {
  args: {
    ...Default.args,
    agreement: <Item>Agreement item can go here!</Item>,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: Default.render,
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isMakingRequest: true,
  },
  render: Default.render,
};

export default meta;
