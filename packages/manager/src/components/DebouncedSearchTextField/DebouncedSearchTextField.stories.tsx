import * as React from 'react';

import { DebouncedSearchTextField } from './DebouncedSearchTextField';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DebouncedSearchTextField>;

const exampleList = [
  'apples',
  'oranges',
  'grapes',
  'walruses',
  'keyboards',
  'chairs',
  'speakers',
  'ecumenical council number two',
];

export const Default: Story = {
  render: (args) => <DebouncedSearchTextField {...args} />,
};

const meta: Meta<typeof DebouncedSearchTextField> = {
  component: DebouncedSearchTextField,
  title: 'Components/Search',
};

export default meta;
