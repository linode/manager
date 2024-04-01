import React from 'react';

import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';

import type { Meta, StoryObj } from '@storybook/react';
import type { DescriptionListProps } from 'src/components/DescriptionList/DescriptionList';

const defaultItems = [
  {
    description: 'Some description related to the label (long)',
    title: 'Random title',
  },
  {
    description: 'That',
    title: 'This',
  },
  {
    description: 'Another description',
    title: 'Another',
  },
];

const meta: Meta<DescriptionListProps> = {
  argTypes: {},
  args: {
    items: defaultItems,
    layout: 'stacked',
  },
  component: DescriptionList,
  title: 'Components/DescriptionList',
};

export default meta;

type Story = StoryObj<DescriptionListProps>;

export const Default: Story = {
  render: (args) => <DescriptionList {...args} />,
};
