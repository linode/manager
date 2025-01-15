import { IconButton } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import { TableBody, TableCell, TableHead, Typography } from '@mui/material';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Taint } from '@linode/api-v4';

export const TaintTable = () => {
  const { setValue, watch } = useFormContext();

  const taints: Taint[] = watch('taints');

  const handleRemoveTaint = (key: string) => {
    setValue(
      'taints',
      taints.filter((taint) => taint.key !== key)
    );
  };

  return (
    <StyledLabelTable aria-label="List of Node Pool Taints">
      <TableHead>
        <TableRow>
          <TableCell>Node Taint</TableCell>
          <TableCell>Effect</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {taints && taints.length > 0 ? (
          taints.map((taint) => {
            return (
              <TableRow
                // sx={{
                //   alignItems: 'center',
                //   display: 'flex',
                //   flexDirection: 'row',
                // }}
                key={`taint-row-${taint.key}`}
              >
                <TableCell>
                  {taint.key}: {taint.value}
                </TableCell>
                <TableCell>{taint.effect}</TableCell>
                <TableCell sx={{ paddingX: 0 }}>
                  <IconButton
                    aria-label={`remove ${taint.key}: ${taint.value}`}
                    disableRipple
                    onClick={() => handleRemoveTaint(taint.key)}
                    size="medium"
                  >
                    <Close />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow key="taint-row-empty">
            <TableCell colSpan={3}>
              <Typography textAlign="center">No taints</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </StyledLabelTable>
  );
};
