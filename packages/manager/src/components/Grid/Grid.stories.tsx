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

const gridSizes = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3],
  [4, 4, 4],
  [5, 2, 5],
  [6, 6],
  [7, 5],
  [8, 4],
  [9, 3],
  [10, 2],
  [11, 1],
];

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
            {gridSizes.map((row) =>
              row.map((size, index) => (
                <ColorGrid item key={index} xs={size}>
                  <Item>xs={size}</Item>
                </ColorGrid>
              ))
            )}
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
            {gridSizes.map((row) =>
              row.map((size, index) => (
                <ColorGrid2 key={index} xs={size}>
                  <Item>xs={size}</Item>
                </ColorGrid2>
              ))
            )}
          </Grid2>
        </Box>
      </Box>
    </Box>
  ),
};
