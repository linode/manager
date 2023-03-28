import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from 'src/components/Grid';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Typography } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const ColorGrid2 = styled(Grid2)(() => ({
  backgroundColor: 'yellow',
  border: '1px solid gray',
}));

const ColorGrid = styled(Grid)(() => ({
  backgroundColor: 'orange',
  border: '1px solid gray',
}));

const meta: Meta<typeof Grid2> = {
  title: 'Components/Grid2',
  component: Grid2,
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Grid2>;

export const Default: Story = {
  args: {
    children: 'Grid2',
    spacing: 2,
    columns: 12,
    columnSpacing: undefined,
    container: true,
    direction: 'row',
    lg: false,
    md: false,
    rowSpacing: undefined,
    sm: false,
    sx: {},
    wrap: 'wrap',
    xl: false,
    xs: false,
  },
  render: (args) => (
    <Box sx={{ display: 'flex' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 38px 24px 24px',
        }}
      >
        <Box>
          <Typography variant="h2">Original Grid</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, padding: '20px 0' }}>
          <Grid container spacing={args.spacing} {...args}>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={3}>
              <Item>xs=3</Item>
            </ColorGrid>
            <ColorGrid item xs={3}>
              <Item>xs=3</Item>
            </ColorGrid>
            <ColorGrid item xs={3}>
              <Item>xs=3</Item>
            </ColorGrid>
            <ColorGrid item xs={3}>
              <Item>xs=3</Item>
            </ColorGrid>
            <ColorGrid item xs={4}>
              <Item>xs=4</Item>
            </ColorGrid>
            <ColorGrid item xs={4}>
              <Item>xs=4</Item>
            </ColorGrid>
            <ColorGrid item xs={4}>
              <Item>xs=4</Item>
            </ColorGrid>
            <ColorGrid item xs={5}>
              <Item>xs=5</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={5}>
              <Item>xs=5</Item>
            </ColorGrid>
            <ColorGrid item xs={6}>
              <Item>xs=6</Item>
            </ColorGrid>
            <ColorGrid item xs={6}>
              <Item>xs=6</Item>
            </ColorGrid>
            <ColorGrid item xs={7}>
              <Item>xs=7</Item>
            </ColorGrid>
            <ColorGrid item xs={5}>
              <Item>xs=5</Item>
            </ColorGrid>
            <ColorGrid item xs={8}>
              <Item>xs=8</Item>
            </ColorGrid>
            <ColorGrid item xs={4}>
              <Item>xs=4</Item>
            </ColorGrid>
            <ColorGrid item xs={9}>
              <Item>xs=9</Item>
            </ColorGrid>
            <ColorGrid item xs={3}>
              <Item>xs=3</Item>
            </ColorGrid>
            <ColorGrid item xs={10}>
              <Item>xs=10</Item>
            </ColorGrid>
            <ColorGrid item xs={2}>
              <Item>xs=2</Item>
            </ColorGrid>
            <ColorGrid item xs={11}>
              <Item>xs=11</Item>
            </ColorGrid>
            <ColorGrid item xs={1}>
              <Item>xs=1</Item>
            </ColorGrid>
          </Grid>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 38px 24px 24px',
        }}
      >
        <Box>
          <Typography variant="h2">MUI Grid v2</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, padding: '20px 0' }}>
          <Grid2 container spacing={args.spacing} {...args}>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={3}>
              <Item>xs=3</Item>
            </ColorGrid2>
            <ColorGrid2 xs={3}>
              <Item>xs=3</Item>
            </ColorGrid2>
            <ColorGrid2 xs={3}>
              <Item>xs=3</Item>
            </ColorGrid2>
            <ColorGrid2 xs={3}>
              <Item>xs=3</Item>
            </ColorGrid2>
            <ColorGrid2 xs={4}>
              <Item>xs=4</Item>
            </ColorGrid2>
            <ColorGrid2 xs={4}>
              <Item>xs=4</Item>
            </ColorGrid2>
            <ColorGrid2 xs={4}>
              <Item>xs=4</Item>
            </ColorGrid2>
            <ColorGrid2 xs={5}>
              <Item>xs=5</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={5}>
              <Item>xs=5</Item>
            </ColorGrid2>
            <ColorGrid2 xs={6}>
              <Item>xs=6</Item>
            </ColorGrid2>
            <ColorGrid2 xs={6}>
              <Item>xs=6</Item>
            </ColorGrid2>
            <ColorGrid2 xs={7}>
              <Item>xs=7</Item>
            </ColorGrid2>
            <ColorGrid2 xs={5}>
              <Item>xs=5</Item>
            </ColorGrid2>
            <ColorGrid2 xs={8}>
              <Item>xs=8</Item>
            </ColorGrid2>
            <ColorGrid2 xs={4}>
              <Item>xs=4</Item>
            </ColorGrid2>
            <ColorGrid2 xs={9}>
              <Item>xs=9</Item>
            </ColorGrid2>
            <ColorGrid2 xs={3}>
              <Item>xs=3</Item>
            </ColorGrid2>
            <ColorGrid2 xs={10}>
              <Item>xs=10</Item>
            </ColorGrid2>
            <ColorGrid2 xs={2}>
              <Item>xs=2</Item>
            </ColorGrid2>
            <ColorGrid2 xs={11}>
              <Item>xs=11</Item>
            </ColorGrid2>
            <ColorGrid2 xs={1}>
              <Item>xs=1</Item>
            </ColorGrid2>
          </Grid2>
        </Box>
      </Box>
    </Box>
  ),
};
