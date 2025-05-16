import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import React from 'react';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';

import type { Meta, StoryObj } from '@storybook/react';
import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

const meta: Meta<typeof EntityIcon> = {
  args: { variant: 'compute' },
  component: EntityIcon,
  title: 'Icons/EntityIcon',
};

export default meta;

type Story = StoryObj<typeof EntityIcon>;

const variantList = [
  { displayName: 'Compute', name: 'compute' },
  { displayName: 'Storage', name: 'storage' },
  { displayName: 'Network', name: 'network' },
  { displayName: 'Database', name: 'database' },
  { displayName: 'Monitor', name: 'monitor' },
  { displayName: 'More', name: 'more' },
];

const sxGridItem = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: 125,
};

export const Default: Story = {
  render: (args) => (
    <Grid
      container
      direction="column"
      spacing={2}
      sx={{
        display: 'flex',
      }}
    >
      <Grid size="auto" sx={{ ...sxGridItem }}>
        <EntityIcon {...args} />
        <StyledLabel fontSize="0.875rem">{args.variant}</StyledLabel>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={12}>
          <StyledLabel fontSize="1.5rem">All Variants</StyledLabel>
        </Grid>
        {variantList.map((variant, idx) => {
          return (
            <Grid key={idx} sx={sxGridItem}>
              <EntityIcon variant={variant.name as EntityVariants} />
              <StyledLabel fontSize="0.875rem">
                {variant.displayName}
              </StyledLabel>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  ),
};

const StyledLabel = styled('div')<{ fontSize: string }>(
  ({ theme, ...props }) => ({
    fontSize: props.fontSize,
    margin: theme.spacing(),
  })
);
