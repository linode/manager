import React from 'react';

import { Tag } from './Tag';

import type { TagProps } from './Tag';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TagProps> = {
  render: (args: TagProps) => <Tag {...args} />,
};

export const WithMaxLength: StoryObj<TagProps> = {
  render: (args: TagProps) => (
    <Tag {...args} label="Long Label" maxLength={5} />
  ),
};

const meta: Meta<TagProps> = {
  args: {
    colorVariant: 'lightBlue',
    label: 'Tag',
  },
  component: Tag,
  title: 'Components/Tags/Tag',
};
export default meta;
