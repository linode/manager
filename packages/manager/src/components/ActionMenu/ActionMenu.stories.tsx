import { action } from '@storybook/addon-actions';
import React from 'react';

import { ActionMenu } from './ActionMenu';

import type { Action, ActionMenuProps } from './ActionMenu';
import type { Meta, StoryObj } from '@storybook/react';

const standardActions = [
  {
    onClick: action('First Action clicked'),
    title: 'First Action',
  },
  {
    onClick: action('Second Action clicked'),
    title: 'Second Action',
  },
] as Action[];

const standardAndDisabledActions = [
  ...standardActions,
  {
    disabled: true,
    onClick: action('Disabled Action clicked'),
    title: 'Disabled Action',
    tooltip: 'An explanation as to why this item is disabled',
  },
];

export const Default: StoryObj<ActionMenuProps> = {
  render: (args) => <ActionMenu {...args} />,
};

const meta: Meta<ActionMenuProps> = {
  argTypes: {
    actionsList: {
      options: {
        'disabled actions': standardAndDisabledActions,
        'standard actions': standardActions,
      },
    },
  },
  args: { actionsList: standardActions, ariaLabel: 'action menu' },
  component: ActionMenu,
  title: 'Components/Action Menu',
};

export default meta;
