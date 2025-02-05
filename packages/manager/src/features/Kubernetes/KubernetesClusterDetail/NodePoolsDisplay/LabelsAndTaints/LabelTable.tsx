import { IconButton, Stack, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Label } from '@linode/api-v4';

export const LabelTable = () => {
  const { setValue, watch } = useFormContext();

  const deleteButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const labels: Label = watch('labels');
  const labelsArray = labels ? Object.entries(labels) : [];

  const handleRemoveLabel = (labelKey: string, index: number) => {
    const newLabels = Object.fromEntries(
      labelsArray.filter(([key]) => key !== labelKey)
    );
    setValue('labels', newLabels, { shouldDirty: true });

    // Set focus to the 'x' button on the row above after selected label is removed
    const newFocusedButtonIndex = Math.max(index - 1, 0);
    setTimeout(() => {
      deleteButtonRefs.current[newFocusedButtonIndex]?.focus();
    });
  };

  return (
    <StyledLabelTable aria-label="List of Node Pool Labels">
      <TableHead>
        <TableRow>
          <TableCell>Node Label</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {labels && labelsArray.length > 0 ? (
          labelsArray.map(([key, value], i) => {
            return (
              <TableRow data-qa-label-row={key} key={`label-row-${i}-${key}`}>
                <TableCell>
                  <Stack alignItems="center" direction="row">
                    <Typography>
                      {key}: {value}
                    </Typography>
                    <IconButton
                      aria-label={`Remove ${key}: ${value}`}
                      disableRipple
                      onClick={() => handleRemoveLabel(key, i)}
                      ref={(node) => (deleteButtonRefs.current[i] = node)}
                      size="medium"
                      sx={{ marginLeft: 'auto' }}
                    >
                      <Close />
                    </IconButton>
                  </Stack>
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
