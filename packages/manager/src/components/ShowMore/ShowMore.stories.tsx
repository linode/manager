import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ShowMore } from 'src/components/ShowMore/ShowMore';

const mockArray = [...Array(5)].map((_, i) => String.fromCharCode(97 + i));

const meta: Meta<typeof ShowMore> = {
  title: 'Components/ShowMore',
  component: ShowMore,
};

export default meta;

type Story = StoryObj<typeof ShowMore>;

export const Default: Story = {
  args: {
    items: mockArray,
    ariaItemType: 'Alphabet',
    render: (items: string[]) => {
      return items.map((item) => <span key={item}>{item}</span>);
    },
  },
  render: (args) => <ShowMore {...args} />,
};
