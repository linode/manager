import React from 'react';
import { action } from '@storybook/addon-actions';
import { Dialog } from './Dialog';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
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
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
      control: {
        type: 'select',
      },
      if: { arg: 'fullWidth' },
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
    title: 'This is a Dialog',
    fullHeight: false,
    fullWidth: false,
    maxWidth: 'md',
    onClose: action('onClose'),
    open: true,
    style: { position: 'unset' },
    titleBottomBorder: false,
  },
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
