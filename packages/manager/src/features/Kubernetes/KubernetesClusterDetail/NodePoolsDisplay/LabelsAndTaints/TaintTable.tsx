import { CloseIcon, IconButton, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Taint } from '@linode/api-v4';

export const TaintTable = () => {
  const { setValue, watch } = useFormContext();

  const deleteButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const taints: Taint[] = watch('taints');

  const handleRemoveTaint = (removedTaint: Taint, index: number) => {
    setValue(
      'taints',
      taints.filter(
        (taint) =>
          taint.key !== removedTaint.key ||
          taint.value !== removedTaint.value ||
          taint.effect !== removedTaint.effect
      ),
      { shouldDirty: true }
    );

    // Set focus to the 'x' button on the row above after selected taint is removed
    const newFocusedButtonIndex = Math.max(index - 1, 0);
    setTimeout(() => {
      deleteButtonRefs.current[newFocusedButtonIndex]?.focus();
    });
  };

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
          taints.map((taint, i) => {
            return (
              <TableRow
                data-qa-taint-row={taint.key}
                key={`taint-row-${i}-${taint.key}`}
              >
                <TableCell>
                  {taint.key}: {taint.value}
                </TableCell>
                <TableCell sx={{ paddingRight: 0 }}>
                  <Stack alignItems="center" direction="row">
                    {taint.effect}
                    <IconButton
                      aria-label={`Remove ${taint.key}: ${taint.value}`}
                      disableRipple
                      onClick={() => handleRemoveTaint(taint, i)}
                      ref={(node) => (deleteButtonRefs.current[i] = node)}
                      size="medium"
                      sx={{ marginLeft: 'auto' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
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
