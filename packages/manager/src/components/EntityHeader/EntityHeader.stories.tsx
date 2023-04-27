import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import EntityHeader from './EntityHeader';
import Button from '../Button';
import Link from '../Link';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';

const sxBoxFlex = {
  alignItems: 'center',
  display: 'flex',
};

const meta: Meta<typeof EntityHeader> = {
  title: 'Components/EntityHeader',
  component: EntityHeader,
  argTypes: {
    title: {
      table: {
        disable: true,
      },
    },
  },
  args: {},
};

export default meta;

type Story = StoryObj<typeof EntityHeader>;

export const Default: Story = {
  args: {
    title: <Link to={`linodes/1234`}>linode-001</Link>,
    variant: 'h2',
    isSummaryView: true,
  },
  render: (args) => {
    const sxActionItem = {
      color: '#2575d0',
      fontFamily: '"LatoWeb", sans-serif',
      fontSize: '0.875rem',
      height: '34px',
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: '#3683dc',
        color: '#fff',
      },
    };

    return (
      <EntityHeader {...args}>
        <Box sx={sxBoxFlex}>Chip / Progress Go Here</Box>
        <Box sx={sxBoxFlex}>
          <Hidden mdDown>
            <Button buttonType="secondary" sx={sxActionItem}>
              Power Off
            </Button>
            <Button buttonType="secondary" sx={sxActionItem}>
              Reboot
            </Button>
            <Button buttonType="secondary" sx={sxActionItem}>
              Launch LISH Console
            </Button>
          </Hidden>

          <LinodeActionMenu
            linodeBackups={{
              enabled: true,
              schedule: {
                day: 'Saturday',
                window: 'W0',
              },
              last_successful: '2021-03-27T18:00:00',
            }}
            linodeId={12434}
            linodeLabel="linode-001"
            linodeRegion="us-east"
            linodeStatus="running"
            linodeType={{
              addons: {
                backups: {
                  price: {
                    monthly: 5,
                    hourly: 0.0015,
                  },
                },
              },
              transfer: 2000,
              network_out: 125,
              gpus: 0,
              price: {
                monthly: 20,
                hourly: 0.0075,
              },
              class: 'standard',
              successor: 'g6-standard-1',
              disk: 81920,
              id: 'g6-standard-2',
              label: 'Linode 2GB',
              memory: 2048,
              vcpus: 1,
            }}
            onOpenPowerDialog={function (
              linodeId: number,
              action: Action
            ): void {
              throw new Error('Function not implemented.');
            }}
            onOpenDeleteDialog={function (linodeId: number): void {
              throw new Error('Function not implemented.');
            }}
            onOpenResizeDialog={function (linodeId: number): void {
              throw new Error('Function not implemented.');
            }}
            onOpenRebuildDialog={function (linodeId: number): void {
              throw new Error('Function not implemented.');
            }}
            onOpenRescueDialog={function (linodeId: number): void {
              throw new Error('Function not implemented.');
            }}
            onOpenMigrateDialog={function (linodeId: number): void {
              throw new Error('Function not implemented.');
            }}
          />
        </Box>
      </EntityHeader>
    );
  },
};
