import { Box, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';
import type { Control } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';

import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { EventTypeDetails } from './EventTypeDetails';
import { dataSets } from './StreamCreateDataSetData';

import type { CreateStreamForm, EventType } from './types';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';

export const StreamCreateDataSet = () => {
  const { control } = useFormContext<CreateStreamForm>();

  const getControlledToggle = (
    control: Control<CreateStreamForm>,
    id: EventType,
    name: string
  ) => (
    <Controller
      control={control}
      name={id}
      render={({ field }) => (
        <Toggle
          aria-label={`Toggle ${name} event type`}
          checked={field.value}
          onChange={(_, checked) => field.onChange(checked)}
        />
      )}
    />
  );

  const getTableItems = (): TableItem[] => {
    return dataSets.map(({ id, name, description, details }) => ({
      InnerTable: <EventTypeDetails {...details} />,
      OuterTableCells: (
        <>
          <TableCell>{description}</TableCell>
          <TableCell>{getControlledToggle(control, id, name)}</TableCell>
        </>
      ),
      id,
      label: name,
    }));
  };

  const DataSetTableRowHead = (
    <TableRow>
      <TableCell sx={{ width: '30%' }}>Event Type</TableCell>
      <TableCell sx={{ width: '55%' }}>Description</TableCell>
      <TableCell sx={{ width: '15%' }} />
    </TableRow>
  );

  return (
    <Paper>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h2">Data Set</Typography>
        <DocsLink
          // TODO: Change the link when proper documentation is ready
          href="https://techdocs.akamai.com/cloud-computing/docs"
          label="Docs"
        />
      </Box>
      <Typography sx={{ marginTop: '12px' }}>
        Select the event types you want to capture for monitoring and analysis.
      </Typography>
      <Box sx={{ my: 2 }}>
        <CollapsibleTable
          TableItems={getTableItems()}
          TableRowEmpty={
            <TableRowEmpty
              colSpan={3}
              message={'No Data Sets to choose from.'}
            />
          }
          TableRowHead={DataSetTableRowHead}
        />
      </Box>
    </Paper>
  );
};
