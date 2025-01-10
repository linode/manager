import { TableBody, TableCell, TableHead } from '@mui/material';
import * as React from 'react';

import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Label } from '@linode/api-v4';

interface Props {
  labels: Label | undefined;
}

export const LabelTable = (props: Props) => {
  const { labels } = props;

  return (
    <StyledLabelTable aria-label="List of Node Pool Labels">
      <TableHead>
        <TableRow>
          <TableCell>Node Label</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {labels && Object.entries(labels).length > 0 ? (
          Object.entries(labels).map(([key, label]) => {
            return (
              <TableRow key={`label-row-${key}`}>
                <TableCell>
                  {key}: {label}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow key="label-row-0">
            <TableCell>No labels</TableCell>
          </TableRow>
        )}
      </TableBody>
    </StyledLabelTable>
  );
};
