import { TableBody, TableCell, TableHead, Typography } from '@mui/material';
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
                  <Typography>
                    {key}: {label}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow key="label-row-empty">
            <TableCell>
              <Typography textAlign="center">No labels</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </StyledLabelTable>
  );
};
