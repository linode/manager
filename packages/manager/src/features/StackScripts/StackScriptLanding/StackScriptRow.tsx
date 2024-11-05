import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
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
      <TableCell>
        {type === 'account' ? (
          <Link to={`/stackscripts/${stackscript.id}`}>
            {stackscript.label}
          </Link>
        ) : (
          <>
            <Link
              to={`/stackscripts/community?query=username:${stackscript.username}`}
            >
              {stackscript.username}
            </Link>{' '}
            /{' '}
            <Link to={`/stackscripts/${stackscript.id}`}>
              {stackscript.label}
            </Link>
          </>
        )}
      </TableCell>
      <TableCell>{stackscript.deployments_total}</TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          <DateTimeDisplay value={stackscript.updated} />
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          {stackscript.images.includes('any/all')
            ? 'Any/All'
            : stackscript.images.join(',  ')}
        </TableCell>
      </Hidden>
      {type === 'account' && (
        <Hidden lgDown>
          <TableCell>{stackscript.is_public ? 'Public' : 'Private'}</TableCell>
        </Hidden>
      )}
      <TableCell actionCell noWrap>
        <StackScriptActionMenu
          handlers={handlers}
          stackscript={stackscript}
          type={type}
        />
      </TableCell>
    </TableRow>
  );
};
