import { action } from '@storybook/addon-actions';
import React from 'react';

import { Dialog } from './Dialog';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Dialog> = {
  argTypes: {
    children: { description: 'The contents of the Modal.' },
    error: { description: 'Error that will be shown in the dialog.' },
    fullHeight: {
      description:
        'Should the Modal take up the entire height of the viewport?',
    },
    fullWidth: {
      description: 'Should the Modal take up the entire width of the viewport?',
    },
    maxWidth: {
      control: {
        type: 'select',
      },
      if: { arg: 'fullWidth' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
    },
    onClose: {
      description: 'Callback fired when the component requests to be closed.',
    },
    open: { description: 'Is the modal open?' },
    slotProps: {
      control: {
        type: 'object',
      },
    },
    title: { description: 'Title that appears in the heading of the dialog.' },
  },
  args: {
    fullHeight: false,
    fullWidth: false,
    maxWidth: 'md',
    onClose: action('onClose'),
    open: true,
    style: { position: 'unset' },
    title: 'This is a Dialog',
    titleBottomBorder: false,
    disableAutoFocus: true,
    disableEnforceFocus: true,
    disablePortal: true,
    disableScrollLock: true,
  },
  component: Dialog,
  title: 'Components/Dialog',
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <div>This a basic dialog with children in it.</div>
    </Dialog>
  ),
};
