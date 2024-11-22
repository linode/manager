import { Typography } from '@linode/ui';
import React from 'react';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof CheckoutBar>;

const Item = ({ children }: { children?: React.ReactNode }) => (
  <Typography sx={{ fontStyle: 'italic' }}>{children}</Typography>
);

const defaultArgs = {
  calculatedPrice: 30.0,
  children: <Item>Child items can go here!</Item>,
  heading: 'Checkout',
  onDeploy: () => alert('Deploy clicked'),
  submitText: 'Submit',
};

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
  args: defaultArgs,
};

export const WithAgreement: Story = {
  args: {
    ...defaultArgs,
    agreement: <Item>Agreement item can go here!</Item>,
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    ...defaultArgs,
    isMakingRequest: true,
  },
};

export const WithFooter: Story = {
  args: {
    ...defaultArgs,
    footer: <Item>Footer element can go here!</Item>,
  },
};
