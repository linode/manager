import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { SelectLinodeCard } from './SelectLinodeCard';
import { RenderLinodeProps } from './SelectLinodePanel';

export const SelectLinodeCards = ({
  handleSelection,
  orderBy: { data: linodes },
  selectedLinodeId,
}: RenderLinodeProps) => (
  <Grid container spacing={2}>
    {linodes.map((linode) => (
      <SelectLinodeCard
        handleSelection={() =>
          handleSelection(linode.id, linode.type, linode.specs.disk)
        }
        key={linode.id}
        linode={linode}
        selected={linode.id == selectedLinodeId}
      />
    ))}
  </Grid>
);
