import { Button, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { eventFactory } from 'src/factories';
import { getEventMessage } from 'src/features/Events/utils';

import type { Meta, StoryObj } from '@storybook/react';
import type { VariantType } from 'notistack';

/**
 * #### Timing
 * - Default timing for toast notifications is 5 seconds.
 * - If the message is longer, more complex, or very important, consider increasing the display time accordingly.
 * - If the message is critical (e.g., an Image failed to upload), consider making it persistent until dismissed by the user.
 */

const meta: Meta<typeof Snackbar> = {
  argTypes: {
    anchorOrigin: {
      description:
        'Determine where the toast initially appears vertically and horizontally.',
    },
    hideIconVariant: {
      description:
        'Determine whether variant icons appear to the left of the text in the toast.',
    },
    maxSnack: {
      description:
        'Set the maximum number of toasts that can appear simultaneously.',
    },
  },
  args: {},
  component: Snackbar,
  title: 'Components/Notifications/Snackbar - Toast',
};

export default meta;

type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {
  args: {
    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
    hideIconVariant: false,
    maxSnack: 5,
  },
  render: (args) => <Template {...args} />,
};

function Template(args: any) {
  return (
    <Snackbar {...args}>
      <Example />
    </Snackbar>
  );
}

function Example() {
  const { enqueueSnackbar } = useSnackbar();
  const variants = [
    'default',
    'success',
    'warning',
    'error',
    'info',
    'tip',
  ] as const;
  const showToast = (variant: VariantType) =>
    enqueueSnackbar(
      'Toast message. This will auto destruct after five seconds.',
      {
        variant,
      }
    );
  return (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {variants.map((variant) => (
        <Button
          buttonType="primary"
          key={variant}
          onClick={() => showToast(variant)}
        >
          {variant}
        </Button>
      ))}
    </Stack>
  );
}

export const WithEventMessage: Story = {
  args: {
    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
    hideIconVariant: false,
    maxSnack: 5,
  },
  render: (args) => {
    const WithEventMessage = () => {
      const { enqueueSnackbar } = useSnackbar();
      const message = getEventMessage(
        eventFactory.build({
          action: 'placement_group_assign',
          entity: {
            label: 'Entity',
            url: 'https://google.com',
          },
          secondary_entity: {
            label: 'Secondary Entity',
            url: 'https://google.com',
          },
          status: 'notification',
        })
      );

      return (
        <Button
          buttonType="primary"
          onClick={() => enqueueSnackbar(message, { variant: 'success' })}
        >
          Toast with Event
        </Button>
      );
    };

    return (
      <Snackbar {...args}>
        <WithEventMessage />
      </Snackbar>
    );
  },
};

export const WithLongMessage: Story = {
  args: {
    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
    hideIconVariant: false,
    maxSnack: 5,
  },
  render: (args) => {
    const WithLongMessage = () => {
      const { enqueueSnackbar } = useSnackbar();

      return (
        <Button
          buttonType="primary"
          onClick={() =>
            enqueueSnackbar(
              'Tax Identification Number could not be verified. Please check your Tax ID for accuracy or contact customer support for assistance.',
              { variant: 'error' }
            )
          }
        >
          Toast with Long Message
        </Button>
      );
    };

    return (
      <Snackbar {...args}>
        <WithLongMessage />
      </Snackbar>
    );
  },
};
