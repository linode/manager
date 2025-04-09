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
