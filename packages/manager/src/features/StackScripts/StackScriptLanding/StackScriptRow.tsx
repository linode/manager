import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

import { getStackScriptImages } from '../stackScriptUtils';
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
    <TableRow data-qa-table-row={stackscript.label}>
      <TableCell noWrap sx={{ maxWidth: 450, minWidth: 200 }}>
        <Stack>
          {type === 'account' ? (
            <Link to={`/stackscripts/${stackscript.id}`}>
              {stackscript.label}
            </Link>
          ) : (
            <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Link
                to={`/stackscripts/community?query=username:${stackscript.username}`}
              >
                {stackscript.username}
              </Link>{' '}
              /{' '}
              <Link to={`/stackscripts/${stackscript.id}`}>
                {stackscript.label}
              </Link>
            </Typography>
          )}
          <Typography
            sx={(theme) => ({
              color: theme.textColors.tableHeader,
              fontSize: '.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {stackscript.description}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>{stackscript.deployments_total}</TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          <DateTimeDisplay displayTime={false} value={stackscript.updated} />
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell
          sx={{
            fontSize: '0.75rem !important',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {getStackScriptImages(stackscript.images)}
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