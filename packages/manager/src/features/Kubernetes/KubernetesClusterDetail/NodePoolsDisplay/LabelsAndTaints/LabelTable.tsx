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

  const labels: Label = watch('labels');

  const handleRemoveLabel = (labelKey: string) => {
    const newLabels = Object.fromEntries(
      Object.entries(labels).filter(([key]) => key !== labelKey)
    );
    setValue('labels', newLabels, { shouldDirty: true });
  };

  return (
    <StyledLabelTable aria-label="List of Node Pool Labels">
      <TableHead>
        <TableRow>
          <TableCell>Node Label</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {labels && Object.entries(labels).length > 0 ? (
          Object.entries(labels).map(([key, value]) => {
            return (
              <TableRow data-qa-label-row={key} key={`label-row-${key}`}>
                <TableCell>
                  <Stack alignItems="center" direction="row">
                    <Typography>
                      {key}: {value}
                    </Typography>
                    <IconButton
                      aria-label={`Remove ${key}: ${value}`}
                      disableRipple
                      onClick={() => handleRemoveLabel(key)}
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
