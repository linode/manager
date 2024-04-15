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
    title: 'With a tooltip',
    tooltip: {
      text: 'This is a tooltip',
    },
  },
  {
    description: 'Fourth description',
    title: 'Number 4',
  },
];

const meta: Meta<DescriptionListProps> = {
  args: {
    columnSpacing: 4,
    displayMode: 'column',
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
  render: (args: DescriptionListProps) => (
    <DescriptionList {...args} items={args.items} />
  ),
};

export const Row: Story = {
  name: 'Row',
  render: (args: DescriptionListProps) => (
    <DescriptionList
      {...args}
      displayMode="row"
      items={args.items}
      stackAt="md"
    />
  ),
};

export const Grid: Story = {
  name: 'Grid',
  render: (args: DescriptionListProps) => (
    <DescriptionList
      {...args}
      displayMode="grid"
      gridProps={{ columns: 2 }}
      items={args.items}
      stackAt="md"
    />
  ),
};
