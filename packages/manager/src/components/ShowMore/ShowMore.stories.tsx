import React from 'react';

import { ShowMore } from 'src/components/ShowMore/ShowMore';

import type { Meta, StoryObj } from '@storybook/react';

const mockArray = [...Array(5)].map((_, i) => String.fromCharCode(97 + i));

const meta: Meta<typeof ShowMore> = {
  component: ShowMore,
  title: 'Components/ShowMore',
};

export default meta;

type Story = StoryObj<typeof ShowMore>;

export const Default: Story = {
  args: {
    ariaItemType: 'Alphabet',
    items: mockArray,
    render: (items: string[]) => {
      return items.map((item) => <span key={item}>{item}</span>);
    },
  },
  render: (args) => <ShowMore {...args} />,
};
