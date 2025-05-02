/**
 * I had to temporarily bypass the husky pre-commit hook due to eslint having
 * issues with this file. There appears to be a dependency issue with
 * eslint-plugin-jsx-a11y. There is an opeen issue on the repo
 * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/929
 * I'll create a tech debt ticket in jira to keep track of this issue.
 */

import { Box, FormControlLabel, Radio, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { createDisplayPage } from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { grantTypeMap } from 'src/features/Account/constants';
import { usePagination } from 'src/hooks/usePagination';

import type { Grant, GrantLevel, GrantType } from '@linode/api-v4/lib/account';
import type { Theme } from '@mui/material/styles';

interface Props {
  entity: GrantType;
  entitySetAllTo: (entity: GrantType, value: GrantLevel) => () => void;
  grants: Grant[] | undefined;
  setGrantTo: (entity: string, idx: number, value: GrantLevel) => () => void;
  showHeading?: boolean;
}

export const UserPermissionsEntitySection = React.memo(
  ({ entity, entitySetAllTo, grants, setGrantTo, showHeading }: Props) => {
    const theme: Theme = useTheme();
    const pagination = usePagination(1);

    if (!grants || grants.length === 0) {
      return null;
    }

    const page = createDisplayPage<Grant>(
      pagination.page,
      pagination.pageSize
    )(grants);

    const entityIsAll = (value: GrantLevel): boolean => {
      if (!grants) {
        return false;
      }

      return !grants.some((grant) => grant.permissions !== value);
    };

    return (
      <Box key={entity} marginTop={`${theme.spacing(2)}`} paddingBottom="0">
        {showHeading && (
          <Typography
            sx={{
              marginBottom: theme.spacing(2),
              marginTop: theme.spacing(3),
            }}
            data-qa-permissions-header={entity}
            variant="h3"
          >
            {grantTypeMap[entity]}
          </Typography>
        )}
        <Table aria-label="User Permissions">
          <TableHead data-qa-table-head>
            <TableRow
              sx={(theme) => ({
                'span.MuiFormControlLabel-label': {
                  font: theme.font.bold,
                },
              })}
            >
              <TableCell>Label</TableCell>
              <TableCell padding="checkbox">
                <FormControlLabel
                  control={
                    <Radio
                      inputProps={{
                        'aria-label': `${entity}s, set-all-permissions-to-none`,
                      }}
                      checked={entityIsAll(null)}
                      data-qa-permission-header="None"
                      name={`${entity}-select-all`}
                      onChange={entitySetAllTo(entity, null)}
                      value="null"
                    />
                  }
                  label="None"
                />
              </TableCell>
              <TableCell padding="checkbox">
                <FormControlLabel
                  control={
                    <Radio
                      inputProps={{
                        'aria-label': `${entity}s, set-all-permissions-to-read-only`,
                      }}
                      checked={entityIsAll('read_only')}
                      data-qa-permission-header="Read Only"
                      name={`${entity}-select-all`}
                      onChange={entitySetAllTo(entity, 'read_only')}
                      value="read_only"
                    />
                  }
                  label="Read Only"
                />
              </TableCell>
              <TableCell padding="checkbox">
                <FormControlLabel
                  control={
                    <Radio
                      inputProps={{
                        'aria-label': `${entity}s, set-all-permissions-to-read-write`,
                      }}
                      checked={entityIsAll('read_write')}
                      data-qa-permission-header="Read-Write"
                      name={`${entity}-select-all`}
                      onChange={entitySetAllTo(entity, 'read_write')}
                      value="read_write"
                    />
                  }
                  label="Read-Write"
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {page.map((grant, _idx) => {
              // Index must be corrected to account for pagination
              const idx = (pagination.page - 1) * pagination.pageSize + _idx;
              return (
                <TableRow data-qa-specific-grant={grant.label} key={grant.id}>
                  <TableCell
                    sx={{
                      '& div': {
                        [theme.breakpoints.down('sm')]: {
                          width: '100%',
                        },
                      },
                    }}
                  >
                    {grant.label}
                  </TableCell>
                  <TableCell padding="checkbox">
                    <Radio
                      inputProps={{
                        'aria-label': `Disallow access for ${grant.label}`,
                        name: `${grant.label}-permissions`,
                      }}
                      checked={grant.permissions === null}
                      data-qa-permission="None"
                      edge="start"
                      onChange={setGrantTo(entity, idx, null)}
                      value="null"
                    />
                  </TableCell>
                  <TableCell padding="checkbox">
                    <Radio
                      inputProps={{
                        'aria-label': `Allow read-only access for ${grant.label}`,
                        name: `${grant.label}-permissions`,
                      }}
                      checked={grant.permissions === 'read_only'}
                      data-qa-permission="Read Only"
                      edge="start"
                      onChange={setGrantTo(entity, idx, 'read_only')}
                      value="read_only"
                    />
                  </TableCell>
                  <TableCell padding="checkbox">
                    <Radio
                      inputProps={{
                        'aria-label': `Allow read-write access for ${grant.label}`,
                        name: `${grant.label}-permissions`,
                      }}
                      checked={grant.permissions === 'read_write'}
                      data-qa-permission="Read-Write"
                      edge="start"
                      onChange={setGrantTo(entity, idx, 'read_write')}
                      value="read_write"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <PaginationFooter
          count={grants.length}
          eventCategory={`User Permissions for ${entity}`}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Box>
    );
  }
);
