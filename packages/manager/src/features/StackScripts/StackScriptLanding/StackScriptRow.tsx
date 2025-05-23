import { Stack, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

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
      <TableCell sx={{ maxWidth: { lg: 400, md: 300, sm: 200, xs: 225 } }}>
        <Stack>
          <Link
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            to={`/stackscripts/${stackscript.id}`}
          >
            {stackscript.username} / <span>{stackscript.label}</span>
          </Link>
          <Typography
            sx={(theme) => ({
              color: theme.textColors.tableHeader,
              fontSize: '.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
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
