import React from 'react';

import {
  notificationCenterContext as _notificationContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationCenterContext';

import { NotificationMenu } from './NotificationMenu';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof NotificationMenu>;

const meta: Meta<typeof NotificationMenu> = {
  component: NotificationMenu,
  decorators: [
    (Story: StoryFn) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const contextValue = useNotificationContext();
      const NotificationProvider = _notificationContext.Provider;
      return (
        <NotificationProvider value={contextValue}>
          <Story />
        </NotificationProvider>
      );
    },
  ],
  render: () => <NotificationMenu />,
  title: 'Components/Notifications/Notification Menu',
};

export default meta;

export const Default: Story = {
  render: (args) => <NotificationMenu />,
};
