import * as React from 'react';

import { Currency } from './Currency';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: {
    decimalPlaces: 2,
    quantity: 4.0,
    wrapInParentheses: false,
  },
  render: (args) => <Currency {...args} />,
};

export const AdaptivePrecision: Story = {
  args: {
    quantity: 0.0159,
    useAdaptivePrecision: true,
  },
  render: (args) => (
    <>
      <Currency {...args} quantity={10} />
      {' · '}
      <Currency {...args} quantity={0.0159} />
      {' · '}
      <Currency {...args} quantity={10.5} />
    </>
  ),
};

const meta: Meta<typeof Currency> = {
  argTypes: {
    decimalPlaces: {
      control: {
        min: 0,
      },
    },
  },
  component: Currency,
  title: 'Foundations/Typography/Currency',
};

export default meta;
