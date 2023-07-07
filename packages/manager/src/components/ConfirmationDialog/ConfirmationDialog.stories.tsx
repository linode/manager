import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ConfirmationDialog> = {
  title: 'Components/Dialog/ConfirmationDialog',
  component: ConfirmationDialog,
  argTypes: {
    actions: {
      description:
        'Items that get rendered in the footer of the Dialog. Typicaly you put an `<ActionsPanel />` with `<Button />`s in it.',
      control: {
        type: 'jsx',
      },
    },
    children: { description: 'The contents of the Modal.' },
    error: { description: 'Error that will be shown in the dialog.' },
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
    open: { description: 'Is the modal open?' },
    title: { description: 'Title that appears in the heading of the dialog.' },
  },
  args: {
    actions: (
      <ActionsPanel
        primary
        primaryButtonText="Continue"
        secondary
        secondaryButtonText="Cancel"
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
