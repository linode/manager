import { action } from '@storybook/addon-actions';
import React from 'react';

import { TagButton } from './TagButton';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TagButton> = {
  args: {
    children: 'Tag',
    disabled: false,
    onClick: () => null,
  },
  component: TagButton,
  title: 'Components/Tags/TagButton',
};

export default meta;

type Story = StoryObj<typeof TagButton>;

export const Default: Story = {
  args: {
    children: 'Add a Tag',
    disabled: false,
    onClick: action('onClick'),
  },
  render: (args) => <TagButton {...args} />,
};
