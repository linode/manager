/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Radio } from 'src/components/Radio/Radio';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
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

  // Never show LKE StackScripts. We try to hide these from the user, even though they
  // are returned by the API.
  if (stackscript.username.startsWith('lke-service-account-')) {
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
                fontFamily={(theme) => theme.font.bold}
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
      <TableCell actionCell sx={{ minWidth: 120 }}>
        <InlineMenuAction actionText="Show Details" onClick={onOpenDetails} />
      </TableCell>
    </TableRow>
  );
};
