import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useSnackbar } from 'notistack';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import Button from 'src/components/Button';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Notifications/Toasts',
  component: Snackbar,
  argTypes: {
    anchorOrigin: {
      description:
        'Determine where the toast initially appears vertically and horizontally.',
    },
    maxSnack: {
      description:
        'Set the maximum number of toasts that can appear simultaneously.',
    },
    hideIconVariant: {
      description:
        'Determine whether variant icons appear to the left of the text in the toast.',
    },
  },
  args: {},
};

export default meta;

type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {
  args: {
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    maxSnack: 5,
    hideIconVariant: true,
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
  const { variant, onClick, sx } = args;
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
            key={eachVariant}
            variant={eachVariant}
            onClick={showToast}
            sx={{
              margin: '0 5px',
            }}
          />
        );
      })}
    </>
  );
}
