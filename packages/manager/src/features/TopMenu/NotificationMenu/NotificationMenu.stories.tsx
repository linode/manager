import React from 'react';

import { NotificationMenu } from './NotificationMenu';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Story = StoryObj<typeof NotificationMenu>;

const meta: Meta<typeof NotificationMenu> = {
  component: NotificationMenu,
  render: () => <NotificationMenu />,
  title: 'Components/Notifications/Notification Menu',
};

export default meta;

export const Default: Story = {
  render: (args) => <NotificationMenu />,
};
