import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Radio } from 'src/components/Radio/Radio';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { StackScript } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  stackscript: StackScript;
}

export const StackScriptSelectionRow = (props: Props) => {
  const { disabled, isSelected, onSelect, stackscript } = props;

  if (stackscript.username.startsWith('lke-service-account-')) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <Radio checked={isSelected} disabled={disabled} onChange={onSelect} />
      </TableCell>
      <TableCell>{stackscript.label}</TableCell>
      <TableCell actionCell>
        <InlineMenuAction actionText="Show Details" />
      </TableCell>
    </TableRow>
  );
};
