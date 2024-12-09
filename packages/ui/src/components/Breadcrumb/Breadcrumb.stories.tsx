import { action } from '@storybook/addon-actions';
import React from 'react';

import { Breadcrumb } from './Breadcrumb';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  title: 'Foundations/Breadcrumb',
};

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    firstAndLastOnly: false,
    onEditHandlers: {
      editableTextTitle: 'test',
      onCancel: () => action('onCancel'),
      onEdit: async () => action('onEdit'),
    },
    pathname: '/linodes/9872893679817/test/lastcrumb',
  },
  render: (args) => <Breadcrumb {...args} />,
};

export default meta;
