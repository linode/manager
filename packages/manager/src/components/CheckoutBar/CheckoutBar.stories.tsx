import React from 'react';

import { Box } from 'src/components/Box';

import { CheckoutBar } from './CheckoutBar';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CheckoutBar> = {
  component: CheckoutBar,
  title: 'Components/CheckoutBar',
};

type Story = StoryObj<typeof CheckoutBar>;

const Item = ({ children }: any) => (
  <div style={{ color: 'white', fontStyle: 'italic' }}>{children}</div>
);

export const Default: Story = {
  args: {
    calculatedPrice: 30.0,
    children: <Item>Children items can go here!</Item>,
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
    submitText: 'Submit',
  },
  render: (args) => (
    <Box sx={{ margin: '1em 2em' }}>
      <CheckoutBar {...args} />
    </Box>
  ),
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
