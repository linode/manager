import { http, HttpResponse } from 'msw';
import React, { createContext } from 'react';

import { notificationCenterContext as _notificationContext } from 'src/features/NotificationCenter/NotificationCenterContext';

import { NotificationMenu } from './NotificationMenu';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import type { NotificationCenterContextProps } from 'src/features/NotificationCenter/NotificationCenterContext';
// import { styled } from '@mui/material';
// import { Box } from 'src/components/Box';

type Story = StoryObj<typeof NotificationMenu>;

const sampleData: any = {
  data: [
    {
      body: null,
      entity: null,
      label: 'past due',
      message:
        'You have a past due balance of $58.50. Please make a payment immediately to avoid service disruption.',
      severity: 'critical',
      type: 'payment_due',
      until: null,
      when: null,
    },
    {
      body:
        'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
      entity: {
        id: 9,
        label: 'linode-9',
        type: 'linode',
        url: '/linode/instances/9',
      },
      label: 'maintenance',
      message: 'This Linode will be affected by critical maintenance!',
      severity: 'critical',
      type: 'maintenance',
      until: null,
      when: '2024-09-19',
    },
    {
      body: null,
      entity: null,
      label: "We've updated our policies.",
      message: `We've updated our policies. See <a href='https://cloud.linode.com/support'>this page</a> for more information.`,
      severity: 'minor',
      type: 'notice',
      until: null,
      when: null,
    },
    {
      body: null,
      entity: {
        id: 'us-east',
        label: null,
        type: 'region',
        url: '/regions/us-east',
      },
      label: 'There is an issue affecting service in this facility',
      message:
        'We are aware of an issue affecting service in this facility. If you are experiencing service issues in this facility, there is no need to open a support ticket at this time. Please monitor our status blog at https://status.linode.com for further information.  Thank you for your patience and understanding.',
      severity: 'major',
      type: 'outage',
      until: null,
      when: null,
    },
    {
      body:
        'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
      entity: {
        id: 3,
        label: 'linode-3',
        type: 'linode',
        url: '/linode/instances/3',
      },
      label: 'maintenance',
      message: 'Testing for minor notification',
      severity: 'minor',
      type: 'notice',
      until: null,
      when: '2024-09-19',
    },
    {
      body:
        'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
      entity: {
        id: 4,
        label: 'linode-4',
        type: 'linode',
        url: '/linode/instances/4',
      },
      label: 'maintenance',
      message: 'Testing for critical notification',
      severity: 'critical',
      type: 'notice',
      until: null,
      when: '2024-09-19',
    },
    {
      body:
        'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
      entity: {
        id: 0,
        label: 'linode-0',
        type: 'linode',
        url: '/linode/instances/2',
      },
      label: 'You have a migration pending!',
      message:
        'You have a migration pending! Your Linode must be offline before starting the migration.',
      severity: 'major',
      type: 'migration_pending',
      until: null,
      when: '2024-09-19',
    },
  ],
  page: 1,
  pages: 1,
  results: 7,
};

const meta: Meta<typeof NotificationMenu> = {
  component: NotificationMenu,
  decorators: [
    (Story: StoryFn) => {
      const initialState: NotificationCenterContextProps = {
        closeMenu: () => null,
        menuOpen: true,
        openMenu: () => {
          //   console.log('this works!!');
        },
      };

      const notificationContext = createContext<NotificationCenterContextProps>(
        initialState
      );
      const NotificationProvider = notificationContext.Provider;
      //   return (
      //     <Box sx={{ padding: 4, backgroundColor: 'red' }}>
      //       <Story />
      //     </Box>
      //   );
      return (
        <NotificationProvider value={initialState}>
          <Story />
        </NotificationProvider>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.linode.com/v4/account/notifications', () => {
          return HttpResponse.json(sampleData.data);
        }),
      ],
    },
  },
  render: () => <NotificationMenu />,
  title: 'Components/Notifications/Notification Menu',
};

export default meta;

export const Default: Story = {};
