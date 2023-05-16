import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { styled } from '@mui/material/styles';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';
import Grid from '@mui/material/Unstable_Grid2';

const meta: Meta<typeof EntityIcon> = {
  title: 'Components/EntityIcon',
  component: EntityIcon,
  argTypes: {},
  args: {},
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
  { displayName: 'Kubernetes', name: 'kube' },
  { displayName: 'Object Storage', name: 'bucket' },
  { displayName: 'Longview', name: 'longview' },
  { displayName: 'Marketplace', name: 'oca' },
];

const sxGridItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 125,
  '& svg': {
    color: '#333',
  },
};

export const Default: Story = {
  args: {
    variant: 'linode',
  },
  render: (args) => (
    <Grid container spacing={2}>
      <Grid xs="auto" sx={{ ...sxGridItem, marginBottom: '20px' }}>
        <EntityIcon variant={args.variant as EntityVariants} />
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
