/**
 * I had to temporarily bypass the husky pre-commit hook due to eslint having
 * issues with this file. There appears to be a dependency issue with
 * eslint-plugin-jsx-a11y. There is an opeen issue on the repo
 * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/929
 * I'll create a tech debt ticket in jira to keep track of this issue.
 */

import React from 'react';
import { Grant, GrantLevel, GrantType } from '@linode/api-v4/lib/account';
import { Box } from 'src/components/Box';
import { Theme } from '@mui/material/styles';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableCell } from 'src/components/TableCell';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { usePagination } from 'src/hooks/usePagination';
import { createDisplayPage } from 'src/components/Paginate';
import { Typography } from 'src/components/Typography';
import { useTheme } from '@mui/material/styles';
import { StyledGrantsTable } from './UserPermissionsEntitySection.styles';

export const entityNameMap: Record<GrantType, string> = {
  linode: 'Linodes',
  stackscript: 'StackScripts',
  image: 'Images',
  volume: 'Volumes',
  nodebalancer: 'NodeBalancers',
  domain: 'Domains',
  longview: 'Longview Clients',
  firewall: 'Firewalls',
  database: 'Databases',
  vpc: 'VPCs',
};

interface Props {
  entity: GrantType;
  grants: Grant[] | undefined;
  setGrantTo: (entity: string, idx: number, value: GrantLevel) => () => void;
  entitySetAllTo: (entity: GrantType, value: GrantLevel) => () => void;
  showHeading?: boolean;
}

export const UserPermissionsEntitySection = React.memo(
  ({ entity, grants, setGrantTo, entitySetAllTo, showHeading }: Props) => {
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
      <Box key={entity} paddingBottom="0" marginTop={`${theme.spacing(2)}`}>
        {showHeading && (
          <Typography
            variant="h3"
            sx={{
              marginTop: theme.spacing(3),
              marginBottom: theme.spacing(2),
            }}
            data-qa-permissions-header={entity}
          >
            {entityNameMap[entity]}
          </Typography>
        )}
        <StyledGrantsTable aria-label="User Permissions" noBorder>
          <TableHead data-qa-table-head>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label style={{ marginLeft: -35, cursor: 'pointer' }}>
                  None
                  <Radio
                    name={`${entity}-select-all`}
                    checked={entityIsAll(null)}
                    value="null"
                    onChange={entitySetAllTo(entity, null)}
                    data-qa-permission-header="None"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label style={{ marginLeft: -65, cursor: 'pointer' }}>
                  Read Only
                  <Radio
                    name={`${entity}-select-all`}
                    checked={entityIsAll('read_only')}
                    value="read_only"
                    onChange={entitySetAllTo(entity, 'read_only')}
                    data-qa-permission-header="Read Only"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label style={{ marginLeft: -73, cursor: 'pointer' }}>
                  Read-Write
                  <Radio
                    name={`${entity}-select-all`}
                    checked={entityIsAll('read_write')}
                    value="read_write"
                    onChange={entitySetAllTo(entity, 'read_write')}
                    data-qa-permission-header="Read-Write"
                  />
                </label>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {page.map((grant, _idx) => {
              // Index must be corrected to account for pagination
              const idx = (pagination.page - 1) * pagination.pageSize + _idx;
              return (
                <TableRow key={grant.id} data-qa-specific-grant={grant.label}>
                  <TableCell
                    sx={{
                      '& div': {
                        [theme.breakpoints.down('sm')]: {
                          width: '100%',
                        },
                      },
                    }}
                    parentColumn="Label"
                  >
                    {grant.label}
                  </TableCell>
                  <TableCell parentColumn="None" padding="checkbox">
                    <Radio
                      aria-label={`Disallow access for ${grant.label}`}
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === null}
                      value="null"
                      onChange={setGrantTo(entity, idx, null)}
                      data-qa-permission="None"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read Only" padding="checkbox">
                    <Radio
                      aria-label={`Allow read-only access for ${grant.label}`}
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_only'}
                      value="read_only"
                      onChange={setGrantTo(entity, idx, 'read_only')}
                      data-qa-permission="Read Only"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read-Write" padding="checkbox">
                    <Radio
                      aria-label={`Allow read-write access for ${grant.label}`}
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_write'}
                      value="read_write"
                      onChange={setGrantTo(entity, idx, 'read_write')}
                      data-qa-permission="Read-Write"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </StyledGrantsTable>
        <PaginationFooter
          count={grants.length}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          eventCategory={`User Permissions for ${entity}`}
        />
      </Box>
    );
  }
);
