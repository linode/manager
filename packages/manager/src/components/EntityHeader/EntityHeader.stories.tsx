import { Box, Button } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';

import { Link } from '../Link';

import type { Meta, StoryObj } from '@storybook/react';

const sxBoxFlex = {
  alignItems: 'center',
  display: 'flex',
};

const meta: Meta<typeof EntityHeader> = {
  argTypes: {
    title: {
      table: {
        disable: true,
      },
    },
  },
  args: {},
  component: EntityHeader,
  title: 'Components/EntityHeader',
};

export default meta;

type Story = StoryObj<typeof EntityHeader>;

export const Default: Story = {
  args: {
    isSummaryView: true,
    title: <Link to={`linodes/1234`}>linode-001</Link>,
    variant: 'h2',
  },
  render: (args) => {
    return (
      <EntityHeader {...args}>
        <Box sx={sxBoxFlex}>Chip / Progress Go Here</Box>
        <Box sx={sxBoxFlex}>
          <Hidden mdDown>
            <Button buttonType="secondary">Power Off</Button>
            <Button buttonType="secondary">Reboot</Button>
            <Button buttonType="secondary">Launch LISH Console</Button>
          </Hidden>

          <LinodeActionMenu
            linodeBackups={{
              enabled: true,
              last_successful: '2021-03-27T18:00:00',
              schedule: {
                day: 'Saturday',
                window: 'W0',
              },
            }}
            linodeId={12434}
            linodeLabel="linode-001"
            linodeRegion="us-east"
            linodeStatus="running"
            linodeType={{
              accelerated_devices: 0,
              addons: {
                backups: {
                  price: {
                    hourly: 0.0015,
                    monthly: 5,
                  },
                  region_prices: [
                    {
                      hourly: 0.0048,
                      id: 'id-cgk',
                      monthly: 3.57,
                    },
                    {
                      hourly: 0.0056,
                      id: 'br-gru',
                      monthly: 4.17,
                    },
                  ],
                },
              },
              class: 'standard',
              disk: 81920,
              gpus: 0,
              id: 'g6-standard-2',
              label: 'Linode 2GB',
              memory: 2048,
              network_out: 125,
              price: {
                hourly: 0.0075,
                monthly: 20,
              },
              region_prices: [],
              successor: 'g6-standard-1',
              transfer: 2000,
              vcpus: 1,
            }}
            onOpenDeleteDialog={action('onOpenDeleteDialog')}
            onOpenMigrateDialog={action('onOpenMigrateDialog')}
            onOpenPowerDialog={action('onOpenPowerDialog')}
            onOpenRebuildDialog={action('onOpenRebuildDialog')}
            onOpenRescueDialog={action('onOpenRescueDialog')}
            onOpenResizeDialog={action('onOpenResizeDialog')}
          />
        </Box>
      </EntityHeader>
    );
  },
};
