import { action } from '@storybook/addon-actions';
import React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DeletionDialog> = {
  argTypes: {
    entity: {
      description: 'They type of entity that is going to be deleted',
    },
    error: {
      description: 'Error that will be shown in the dialog.',
    },
    label: {
      description: 'The label of the entity you will delete.',
    },
    maxWidth: {
      control: {
        type: 'select',
      },
      if: { arg: 'fullWidth' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
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
  },
  component: DeletionDialog,
  title: 'Components/Dialog/DeletionDialog',
};

export default meta;

type Story = StoryObj<typeof DeletionDialog>;

export const Default: Story = {
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};

export const DeletionDialogError: Story = {
  args: {
    error: 'There was an error deleting this Linode.',
  },
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};

export const DeletionDialogLoading: Story = {
  args: {
    loading: true,
  },
  render: (args) => <DeletionDialog {...args}>{args.children}</DeletionDialog>,
};
