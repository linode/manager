import { ActionsPanel } from '@linode/ui';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ConfirmationDialog> = {
  argTypes: {
    actions: {
      description:
        'Items that get rendered in the footer of the Dialog. Typicaly you put an `<ActionsPanel />` with `<Button />`s in it.',
    },
    children: { description: 'The contents of the Modal.' },
    error: { description: 'Error that will be shown in the dialog.' },
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
    open: { description: 'Is the modal open?' },
    title: { description: 'Title that appears in the heading of the dialog.' },
  },
  args: {
    actions: (
      <ActionsPanel
        primaryButtonProps={{ label: 'Continue' }}
        secondaryButtonProps={{ label: 'Cancel' }}
      />
    ),
    children:
      'This confirmation modal is making sure you really want to do this.',
    disableAutoFocus: true,
    disableEnforceFocus: true,
    disablePortal: true,
    disableScrollLock: true,
    error: undefined,
    fullWidth: false,
    maxWidth: 'md',
    onClose: action('onClose'),
    open: true,
    style: { position: 'unset' },
    title: 'Enable this feature?',
  },
  component: ConfirmationDialog,
  title: 'Components/Dialog/ConfirmationDialog',
};

export default meta;

type Story = StoryObj<typeof ConfirmationDialog>;

export const Default: Story = {
  render: (args) => (
    <ConfirmationDialog {...args}>{args.children}</ConfirmationDialog>
  ),
};

export const Error: Story = {
  args: {
    error: 'There was an error somewhere in the process.',
  },
  render: (args) => (
    <ConfirmationDialog {...args}>{args.children}</ConfirmationDialog>
  ),
};
