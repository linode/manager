import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { RenderLinodeProps } from './SelectLinodePanel';

export const SelectCards = ({
  disabled,
  handleSelection,
  orderBy: { data: linodes },
  selectedLinodeId,
}: RenderLinodeProps) => (
  <Grid container spacing={2}>
    {linodes.map((linode) => (
      <SelectionCard
        onClick={() => {
          handleSelection(linode.id, linode.type, linode.specs.disk);
        }}
        checked={linode.id === Number(selectedLinodeId)}
        disabled={disabled}
        heading={linode.heading}
        key={`selection-card-${linode.id}`}
        subheadings={linode.subHeadings}
      />
    ))}
  </Grid>
);
