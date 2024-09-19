import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';
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
  title: 'Components/Dialog/TypeToConfirmDialog',
};

export default meta;

type Story = StoryObj<typeof TypeToConfirmDialog>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const deleteButton = canvas.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
  },
  render: (args) => <TypeToConfirmDialog {...args} />,
};

export const WithLinodeLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const linodeLabelInput = canvas.getByLabelText('Linode Label', {
      selector: 'input',
    });

    await userEvent.type(linodeLabelInput, 'test linode', {
      delay: 10,
    });
    const deleteButton = canvas.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toHaveAttribute('aria-disabled');
  },
  render: (args) => <TypeToConfirmDialog {...args} />,
};
