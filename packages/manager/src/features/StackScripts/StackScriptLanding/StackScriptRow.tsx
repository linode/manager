import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { StackScriptActionMenu } from './StackScriptActionMenu';

import type { StackScriptHandlers } from './StackScriptActionMenu';
import type { StackScript } from '@linode/api-v4';

interface Props {
  handlers: StackScriptHandlers;
  stackscript: StackScript;
  type: 'account' | 'community';
}

export const StackScriptRow = (props: Props) => {
  const { handlers, stackscript, type } = props;

  return (
    <TableRow>
      <TableCell>{stackscript.label}</TableCell>
      <TableCell>{stackscript.deployments_total}</TableCell>
      <TableCell noWrap>
        <DateTimeDisplay value={stackscript.updated} />
      </TableCell>
      <TableCell>{stackscript.images.join(', ')}</TableCell>
      {type === 'account' && (
        <TableCell>{stackscript.is_public ? 'Public' : 'Private'}</TableCell>
      )}
      <TableCell actionCell noWrap>
        {type === 'community' ? (
          <InlineMenuAction actionText="Deploy new Linode" />
        ) : (
          <StackScriptActionMenu
            handlers={handlers}
            stackscript={stackscript}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
