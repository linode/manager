import * as React from 'react';

import { Tags } from './Tags';

import type { TagsProps } from './Tags';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TagsProps> = {
  render: (args) => <Tags {...args} />,
};

const meta: Meta<TagsProps> = {
  args: {
    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
  },
  component: Tags,
  title: 'Components/Tags/Tags List',
};
export default meta;
