import { action } from '@storybook/addon-actions';
import React from 'react';

import { TypeToConfirmDialog } from './TypeToConfirmDialog';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TypeToConfirmDialog> = {
  argTypes: {
    children: {
      description: 'The items of the Dialog, passed-in as sub-components.',
    },
    error: { description: 'Error that will be shown in the dialog.' },
    onClick: {
      description: 'Callback fired when the action is confirmed.',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback fired when the component requests to be closed.',
    },
    open: { description: 'Is the modal open?' },
    title: { description: 'Title that appears in the heading of the dialog.' },
  },
  args: {
    children: '',
    entity: {
      action: 'deletion',
      name: 'test linode',
      primaryBtnText: 'Delete',
      type: 'Linode',
    },
    error: undefined,
    label: 'Linode Label',
    loading: false,
    onClick: action('onDelete'),
    onClose: action('onClose'),
    open: true,
    title: 'Delete Linode?',
  },
  component: TypeToConfirmDialog,
  title: 'Components/TypeToConfirmDialog',
};

export default meta;

type Story = StoryObj<typeof TypeToConfirmDialog>;

export const Default: Story = {
  render: (args) => (
    <TypeToConfirmDialog {...args}>{args.children}</TypeToConfirmDialog>
  ),
};
