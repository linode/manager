import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { ActionsPanel } from './ActionsPanel/ActionsPanel';
import { Button } from './Button/Button';
import { Drawer } from './Drawer';
import { TextField } from './TextField';
import { Typography } from './Typography';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  title: 'Components/Drawer',
};

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    onClose: action('onClose'),
    open: false,
    title: 'My Drawer',
  },
  render: (args) => {
    const DrawerExampleWrapper = () => {
      const [open, setOpen] = React.useState(args.open);
      return (
        <>
          <Button buttonType="primary" onClick={() => setOpen(true)}>
            Click to open Drawer
          </Button>
          <Drawer {...args} onClose={() => setOpen(false)} open={open}>
            <Typography>
              This is some test copy which acts as content for this Drawer
              component. It's very interesting and you should read all of it.
              This text has to be sufficiently long to test that it doesn't
              expand the drawer to an unreasonable width.
            </Typography>
            <TextField
              label="Input Some Text"
              placeholder="This is a placeholder"
            />
            <ActionsPanel
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: () => setOpen(false),
              }}
              primaryButtonProps={{ label: 'Save' }}
            />
          </Drawer>
        </>
      );
    };
    return <DrawerExampleWrapper />;
  },
};

export default meta;
