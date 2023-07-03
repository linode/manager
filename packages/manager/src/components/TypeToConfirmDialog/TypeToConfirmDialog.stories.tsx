import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { TypeToConfirmDialog } from './TypeToConfirmDialog';

const meta: Meta<typeof TypeToConfirmDialog> = {
  title: 'Components/TypeToConfirmDialog',
  component: TypeToConfirmDialog,
  argTypes: {
    children: {
      description: 'The items of the Dialog, passed-in as sub-components.',
    },
    error: { description: 'Error that will be shown in the dialog.' },
    onClose: {
      action: 'onClose',
      description: 'Callback fired when the component requests to be closed.',
    },
    onClick: {
      description: 'Callback fired when the action is confirmed.',
    },
    open: { description: 'Is the modal open?' },
    title: { description: 'Title that appears in the heading of the dialog.' },
  },
  args: {
    open: true,
    title: 'Delete Linode?',
    onClose: action('onClose'),
    onClick: action('onDelete'),
    loading: false,
    label: 'Linode Label',
    children: '',
    error: undefined,
    entity: {
      type: 'Linode',
      action: 'deletion',
      name: 'test linode',
      primaryBtnText: 'Delete',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TypeToConfirmDialog>;

export const Default: Story = {
  render: (args) => (
    <TypeToConfirmDialog {...args}>{args.children}</TypeToConfirmDialog>
  ),
};
