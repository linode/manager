import React from 'react';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof CheckoutBar>;

const Item = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ color: 'white', fontStyle: 'italic' }}>{children}</div>
);

const meta: Meta<typeof CheckoutBar> = {
  argTypes: {
    onDeploy: { action: 'onDeploy' },
  },
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

export default meta;

export const Default: Story = {
  args: {
    calculatedPrice: 30.0,
    children: <Item>Child items can go here!</Item>,
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
    submitText: 'Submit',
  },
};

export const WithAgreement: Story = {
  args: {
    ...Default.args,
    agreement: <Item>Agreement item can go here!</Item>,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isMakingRequest: true,
  },
};

export const WithFooter: Story = {
  args: {
    ...Default.args,
    footer: <Item>Footer element can go here!</Item>,
  },
};
