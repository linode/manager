import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { Typography } from 'src/components/Typography';

import { SelectLinodeCard } from './SelectLinodeCard';
import { RenderLinodeProps } from './SelectLinodePanel';

export const SelectLinodeCards = ({
  disabled,
  handleSelection,
  orderBy: { data: linodes },
  selectedLinodeId,
}: RenderLinodeProps) => (
  <Grid container spacing={2}>
    {linodes.length > 0 ? (
      linodes.map((linode) => (
        <SelectLinodeCard
          handleSelection={() =>
            handleSelection(linode.id, linode.type, linode.specs.disk)
          }
          disabled={disabled}
          key={linode.id}
          linode={linode}
          selected={linode.id == selectedLinodeId}
        />
      ))
    ) : (
      <Typography padding={1}>No results</Typography>
    )}
  </Grid>
);
