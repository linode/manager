import { Button, Typography } from '@linode/ui';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
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
    disableAutoFocus: true,
    disableEnforceFocus: true,
    disablePortal: true,
    disableScrollLock: true,
    fullHeight: false,
    fullWidth: false,
    maxWidth: 'md',
    onClose: action('onClose'),
    open: true,
    style: { position: 'unset' },
    title: 'This is a Dialog',
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

export const Fetching: Story = {
  args: {
    isFetching: true,
  },
  render: (args) => {
    const DrawerExampleWrapper = () => {
      const [{ isFetching, open }, updateArgs] = useArgs();

      React.useEffect(() => {
        if (open) {
          setTimeout(() => {
            updateArgs({ isFetching: false, onClose: action('onClose') });
          }, 1500);
        } else {
          setTimeout(() => {
            updateArgs({ isFetching: true, onClose: action('onClose') });
          }, 300);
        }
      }, [isFetching, open, updateArgs]);

      return (
        <>
          <Button
            buttonType="primary"
            onClick={() => updateArgs({ open: true })}
            sx={{ m: 4 }}
          >
            Click to open Dialog
          </Button>
          <Dialog
            {...args}
            isFetching={isFetching}
            onClose={() => updateArgs({ open: false })}
            open={open}
          >
            <Typography sx={{ mb: 2 }}>
              A most sober dialog, with a title and a description.
            </Typography>
            <Button
              buttonType="primary"
              onClick={() => updateArgs({ open: false })}
            >
              Close This Thing
            </Button>
          </Dialog>
        </>
      );
    };

    return DrawerExampleWrapper();
  },
};
