import * as React from 'react';

import { Currency } from './Currency';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: {
    decimalPlaces: 2,
    quantity: 4.0,
    wrapInParentheses: false,
  },
  render: (args) => <Currency {...args} />,
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
