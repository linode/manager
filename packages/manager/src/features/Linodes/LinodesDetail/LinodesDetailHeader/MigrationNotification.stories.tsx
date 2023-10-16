import { action } from '@storybook/addon-actions';
import React from 'react';

import { MigrationNotification } from './MigrationNotification';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MigrationNotification> = {
  argTypes: {},
  args: {
    linodeID: 123456,
    migrationTime: '2025-10-21T20:00:00',
    notificationMessage: 'Your Linode has been scheduled for migration.',
    notificationType: 'migration_scheduled',
    requestNotifications: action('requestNotifications'),
  },
  component: MigrationNotification,
  title: 'Components/Notifications/MigrationNotification',
};

export default meta;

type Story = StoryObj<typeof MigrationNotification>;

/**
 * Default Primary MigrationNotification
 *  Bold and easily visible. Represents the primary or preferred action on the page.
 */
export const Default: Story = {
  args: {},
  render: (args) => <MigrationNotification {...args} />,
};
