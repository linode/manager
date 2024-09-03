import { action } from '@storybook/addon-actions';
import React from 'react';

import { InlineMenuAction } from './InlineMenuAction';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InlineMenuAction> = {
  argTypes: {},
  args: {
    actionText: 'Action Text',
    className: 'my-class',
    disabled: false,
    loading: false,
    onClick: action('onClick'),
    tooltip: 'Tooltip Text',
    tooltipAnalyticsEvent: action('tooltipAnalyticsEvent'),
  },
  component: InlineMenuAction,
  title: 'Components/Action Menu/InlineMenuAction',
};

export default meta;

type Story = StoryObj<typeof InlineMenuAction>;

/**
 * Inline action menu item for use in tables and other inline menus.
 * The default action is a button, but it can also be a link.
 */

export const Default: Story = {
  args: {},
  render: (args) => <InlineMenuAction {...args} />,
};

export const Link: Story = {
  args: {
    href: 'https://www.linode.com',
  },
  render: (args) => <InlineMenuAction {...args} />,
};
