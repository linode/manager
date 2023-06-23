import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';

const meta: Meta<typeof DeletionDialog> = {
  title: 'Components/Dialog/DeletionDialog',
  component: DeletionDialog,
  argTypes: {
    maxWidth: {
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
      control: {
        type: 'select',
      },
      if: { arg: 'fullWidth' },
    },
    onClose: {
      action: 'onClose',
      description: 'Callback fired when the component requests to be closed.',
    },
    onDelete: {
      action: 'onDelete',
    },
    open: {
      description: 'Is the modal open?',
    },
    typeToConfirm: {
      description: `Whether or not a user is required to type the enity's label to delete.`,
    },
    entity: {
      description: 'They type of entity that is going to be deleted',
    },
    label: {
      description: 'The label of the entity you will delete.',
    },
    error: {
      description: 'Error that will be shown in the dialog.',
    },
  },
  args: {
    disableAutoFocus: true,
    disableEnforceFocus: true,
    disablePortal: true,
    disableScrollLock: true,
    entity: 'Linode',
    error: undefined,
    fullWidth: false,
    label: 'my-linode-0',
    loading: false,
    maxWidth: 'md',
    onClose: action('onClose'),
    onDelete: action('onDelete'),
    open: true,
    style: { position: 'unset' },
    typeToConfirm: true,
  },
};

export default meta;

type Story = StoryObj<typeof DeletionDialog>;

export const Default: Story = {
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};

export const Error: Story = {
  args: {
    error: 'There was an error deleting this Linode.',
  },
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};
