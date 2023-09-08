import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { ActionPanelProps, ActionsPanel } from './ActionsPanel';

const meta: Meta<typeof ActionsPanel> = {
  component: ActionsPanel,
  title: 'Components/ActionsPanel',
};

type Story = StoryObj<typeof ActionsPanel>;

const primaryButtonProps = {
  label: 'Confirm',
};

const secondaryButtonProps = {
  label: 'Cancel',
};

const disabledPrimaryButtonProps = {
  ...primaryButtonProps,
  disabled: true,
};

const disabledSecondaryButtonProps = {
  ...secondaryButtonProps,
  disabled: true,
};

export const StandardActions: Story = {
  argTypes: {
    primaryButtonProps: {
      options: {
        'disabled actions': disabledPrimaryButtonProps,
        'standard actions': primaryButtonProps,
      },
    },
    secondaryButtonProps: {
      options: {
        'disabled actions': disabledSecondaryButtonProps,
        'standard actions': secondaryButtonProps,
      },
    },
  },
  args: {
    primaryButtonProps,
    secondaryButtonProps,
  },
  render: (args: ActionPanelProps) => {
    return <ActionsPanel {...args} />;
  },
};

export default meta;
