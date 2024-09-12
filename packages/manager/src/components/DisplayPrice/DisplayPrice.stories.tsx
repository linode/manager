import * as React from 'react';

import { DisplayPrice } from './DisplayPrice';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DisplayPrice>;

const meta: Meta<typeof DisplayPrice> = {
  component: DisplayPrice,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/DisplayPrice',
};

export default meta;

export const Default: Story = {
  args: {
    price: 99,
  },
  render: (args) => <DisplayPrice {...args} />,
};

export const WithFontSize: Story = {
  args: {
    ...Default.args,
    fontSize: '2rem',
  },
};

export const WithDecimalPlaces: Story = {
  args: {
    ...Default.args,
    decimalPlaces: 1,
  },
};

export const WithInterval: Story = {
  args: {
    ...Default.args,
    interval: 'mo',
  },
};
