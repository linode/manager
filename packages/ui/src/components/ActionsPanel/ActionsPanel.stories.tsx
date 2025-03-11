import React from 'react';

import { ActionsPanel } from './ActionsPanel';

import type { ActionPanelProps } from './ActionsPanel';
import type { Meta, StoryObj } from '@storybook/react';

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

export const StandardActions: Story = {
  args: {
    primaryButtonProps,
    secondaryButtonProps,
  },
  render: (args: ActionPanelProps) => {
    return <ActionsPanel sx={{ justifyContent: 'flex-start' }} {...args} />;
  },
};

export default meta;
