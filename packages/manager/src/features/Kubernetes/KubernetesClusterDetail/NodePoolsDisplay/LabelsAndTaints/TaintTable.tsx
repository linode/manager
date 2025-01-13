import { TableBody, TableCell, TableHead, Typography } from '@mui/material';
import * as React from 'react';

import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Taint } from '@linode/api-v4';

interface Props {
  taints: Taint[] | undefined;
}

export const TaintTable = (props: Props) => {
  const { taints } = props;

  return (
    <StyledLabelTable aria-label="List of Node Pool Taints">
      <TableHead>
        <TableRow>
          <TableCell>Node Taint</TableCell>
          <TableCell>Effect</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {taints && taints.length > 0 ? (
          taints.map((taint) => {
            return (
              <TableRow key={`taint-row-${taint.key}`}>
                <TableCell>
                  {taint.key}: {taint.value}
                </TableCell>
                <TableCell>{taint.effect}</TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow key="taint-row-empty">
            <TableCell colSpan={2}>
              <Typography textAlign="center">No taints</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </StyledLabelTable>
  );
};
