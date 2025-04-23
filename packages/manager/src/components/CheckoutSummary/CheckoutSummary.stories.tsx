import { Typography } from '@linode/ui';
import React from 'react';

import { CheckoutSummary } from './CheckoutSummary';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof CheckoutSummary>;

const Item = ({ children }: { children?: React.ReactNode }) => (
  <Typography sx={{ fontStyle: 'italic', marginTop: '1em' }}>
    {children}
  </Typography>
);

const defaultArgs = {
  displaySections: [
    { title: 'Debian 11' },
    { details: '$36/month', title: 'Dedicated 4GB' },
  ],
  heading: 'Checkout Summary',
};

const meta: Meta<typeof CheckoutSummary> = {
  component: CheckoutSummary,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/CheckoutSummary',
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

export const WithChildren: Story = {
  args: {
    ...defaultArgs,
    children: <Item>Child items can go here!</Item>,
  },
};
