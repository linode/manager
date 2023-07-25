import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import React from 'react';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';

import type { Meta, StoryObj } from '@storybook/react';
import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

const meta: Meta<typeof EntityIcon> = {
  args: { variant: 'linode' },
  component: EntityIcon,
  title: 'Components/EntityIcon',
};

export default meta;

type Story = StoryObj<typeof EntityIcon>;

const variantList = [
  { displayName: 'Managed', name: 'managed' },
  { displayName: 'Linode', name: 'linode' },
  { displayName: 'Volume', name: 'volume' },
  { displayName: 'NodeBalancer', name: 'nodebalancer' },
  { displayName: 'Firewall', name: 'firewall' },
  { displayName: 'StackScript', name: 'stackscript' },
  { displayName: 'Image', name: 'image' },
  { displayName: 'Domain', name: 'domain' },
  { displayName: 'Kubernetes', name: 'kubernetes' },
  { displayName: 'Object Storage', name: 'storage' },
  { displayName: 'Longview', name: 'longview' },
  { displayName: 'Marketplace', name: 'marketplace' },
];

const sxGridItem = {
  '& svg': {
    color: '#333',
  },
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: 125,
};

export const Default: Story = {
  render: (args) => (
    <Grid container spacing={2}>
      <Grid sx={{ ...sxGridItem, marginBottom: '20px' }} xs="auto">
        <EntityIcon {...args} />
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={12}>
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
