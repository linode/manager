import { useSnackbar } from 'notistack';
import React from 'react';

import { Button } from 'src/components/Button/Button';
import { Snackbar } from 'src/components/Snackbar/Snackbar';

import type { Meta, StoryObj } from '@storybook/react';

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
    hideIconVariant: true,
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

function MyButton(args: any) {
  const { onClick, sx, variant } = args;
  const handleClick = () => {
    // just call the onClick with the provided variant
    onClick(variant);
  };
  return (
    <Button buttonType="primary" onClick={handleClick} sx={sx}>
      {variant}
    </Button>
  );
}

function Example() {
  const { enqueueSnackbar } = useSnackbar();
  const variants = ['default', 'success', 'warning', 'error', 'info'];
  const showToast = (variant: any) =>
    enqueueSnackbar(
      'Toast message. This will auto destruct after five seconds.',
      {
        variant,
      }
    );
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {variants.map((eachVariant) => {
        // map over each variant and show a button for each
        return (
          <MyButton
            sx={{
              margin: '0 5px',
            }}
            key={eachVariant}
            onClick={showToast}
            variant={eachVariant}
          />
        );
      })}
    </>
  );
}
