import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/client-api';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import ActionsPanel from './ActionsPanel';
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ open }, setArgs] = useArgs();
    return (
      <>
        <Button buttonType="primary" onClick={() => setArgs({ open: true })}>
          Click to open Drawer
        </Button>
        <Drawer {...args} onClose={() => setArgs({ open: false })} open={open}>
          <Typography>
            This is some test copy which acts as content for this Drawer
            component. It's very interesting and you should read all of it. This
            text has to be sufficiently long to test that it doesn't expand the
            drawer to an unreasonable width.
          </Typography>
          <TextField
            label="Input Some Text"
            placeholder="This is a placeholder"
          />
          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={() => setArgs({ open: false })}
            >
              Cancel
            </Button>
            <Button buttonType="primary">Save</Button>
          </ActionsPanel>
        </Drawer>
      </>
    );
  },
};

export default meta;
