/* eslint-disable jsx-a11y/label-has-associated-control */
import { Radio, Stack, Typography } from '@linode/ui';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { isLKEStackScript } from 'src/features/StackScripts/stackScriptUtils';
import { truncate } from 'src/utilities/truncate';

import type { StackScript } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  isSelected: boolean;
  onOpenDetails: () => void;
  onSelect?: () => void;
  stackscript: StackScript;
}

export const StackScriptSelectionRow = (props: Props) => {
  const { disabled, isSelected, onOpenDetails, onSelect, stackscript } = props;

  // Never show LKE StackScripts. We try to hide these from the user even though they
  // are returned by the API.
  if (isLKEStackScript(stackscript)) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <Radio
          checked={isSelected}
          disabled={disabled}
          id={`stackscript-${stackscript.id}`}
          onChange={onSelect}
        />
      </TableCell>
      <TableCell>
        <label htmlFor={`stackscript-${stackscript.id}`}>
          <Stack sx={{ cursor: 'pointer' }}>
            <Typography>
              {stackscript.username} /{' '}
              <Typography
                component="span"
                sx={(theme) => ({ font: theme.font.bold })}
              >
                {stackscript.label}
              </Typography>
            </Typography>
            <Typography
              sx={(theme) => ({
                color: theme.textColors.tableHeader,
                fontSize: '.75rem',
              })}
            >
              {truncate(stackscript.description, 100)}
            </Typography>
          </Stack>
        </label>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          minWidth: 120,
          paddingRight: 0,
          height: 44,
        }}
        actionCell
      >
        <InlineMenuAction actionText="Show Details" onClick={onOpenDetails} />
      </TableCell>
    </TableRow>
  );
};
