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
    title: 'Another Title',
  },
];

const meta: Meta<DescriptionListProps> = {
  argTypes: {
    direction: {
      options: ['column', 'row', 'column-reverse', 'row-reverse'],
    },
    stackAt: {
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
  args: {
    columnSpacing: 4,
    direction: 'column',
    fontSize: '0.9rem',
    items: defaultItems,
    rowSpacing: 1,
    stackAt: undefined,
    sx: {
      mb: 3,
      mt: 3,
    },
  },
  component: DescriptionList,
  title: 'Components/DescriptionList',
};

export default meta;

type Story = StoryObj<DescriptionListProps>;

export const Column: Story = {
  name: 'Column (default)',
  render: (args) => <DescriptionList {...args} items={args.items} />,
};

export const Row: Story = {
  name: 'Row',
  render: (args) => (
    <DescriptionList
      {...args}
      direction="row"
      items={args.items}
      stackAt="md"
    />
  ),
};
