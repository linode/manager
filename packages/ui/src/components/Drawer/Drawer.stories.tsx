import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
import React from 'react';

import { ActionsPanel } from '../ActionsPanel';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { Typography } from '../Typography';
import { Drawer } from './Drawer';

import type { Meta, StoryObj } from '@storybook/react';

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
              primaryButtonProps={{ label: 'Save' }}
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: () => setOpen(false),
              }}
            />
          </Drawer>
        </>
      );
    };
    return <DrawerExampleWrapper />;
  },
};

export const Fetching: Story = {
  args: {
    isFetching: true,
    open: false,
    title: 'My Drawer was Loading',
  },
  render: (args) => {
    const DrawerExampleWrapper = () => {
      const [{ isFetching, open }, updateArgs] = useArgs();

      React.useEffect(() => {
        if (open) {
          setTimeout(() => {
            updateArgs({ isFetching: false, onClose: action('onClose') });
          }, 1500);
        } else {
          setTimeout(() => {
            updateArgs({ isFetching: true, onClose: action('onClose') });
          }, 300);
        }
      }, [isFetching, open, updateArgs]);

      return (
        <>
          <Button
            buttonType="primary"
            onClick={() => updateArgs({ open: true })}
            sx={{ m: 4 }}
          >
            Click to open Drawer
          </Button>
          <Drawer
            {...args}
            isFetching={isFetching}
            onClose={() => updateArgs({ open: false })}
            open={open}
          >
            <Typography sx={{ mb: 2 }}>
              I smirked at their Kale chips banh-mi fingerstache brunch in
              Williamsburg.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Meanwhile in my closet-style flat in Red-Hook, my pour-over coffee
              glitched on my vinyl record player while I styled the bottom left
              corner of my beard. Those artisan tacos I ordered were infused
              with turmeric and locally sourced honey, a true farm-to-table
              vibe. Pabst Blue Ribbon in hand, I sat on my reclaimed wood bench
              next to the macramé plant holder.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Narwhal selfies dominated my Instagram feed, hashtagged with "slow
              living" and "normcore aesthetics". My kombucha brewing kit arrived
              just in time for me to ferment my own chai-infused blend. As I
              adjusted my vintage round glasses, a tiny house documentary
              started playing softly in the background. The retro typewriter
              clacked as I typed out my minimalist poetry on sustainably sourced
              paper. The sun glowed through the window, shining light on the
              delightful cracks of my Apple watch.
            </Typography>
            <Typography sx={{ mb: 2 }}>It was Saturday.</Typography>
            <ActionsPanel
              primaryButtonProps={{ label: 'Save' }}
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: () => updateArgs({ open: false }),
              }}
            />
          </Drawer>
        </>
      );
    };

    return DrawerExampleWrapper();
  },
};

export const NotFound: Story = {
  args: {
    error: 'Not Found',
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
          <Drawer {...args} onClose={() => setOpen(false)} open={open} />
        </>
      );
    };
    return <DrawerExampleWrapper />;
  },
};

export const WithError: Story = {
  args: {
    error: 'Some other Error',
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
          <Drawer {...args} onClose={() => setOpen(false)} open={open} />
        </>
      );
    };
    return <DrawerExampleWrapper />;
  },
};

export default meta;
