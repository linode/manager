/**
 * I had to temporarily bypass the husky pre-commit hook due to eslint having
 * issues with this file. There appears to be a dependency issue with
 * eslint-plugin-jsx-a11y. There is an opeen issue on the repo
 * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/929
 * I'll create a tech debt ticket in jira to keep track of this issue.
 */

import { Grant, GrantLevel, GrantType } from '@linode/api-v4/lib/account';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import React from 'react';

import { Box } from 'src/components/Box';
import { createDisplayPage } from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { usePagination } from 'src/hooks/usePagination';

import { StyledGrantsTable } from './UserPermissionsEntitySection.styles';

export const entityNameMap: Record<GrantType, string> = {
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  linode: 'Linodes',
  longview: 'Longview Clients',
  nodebalancer: 'NodeBalancers',
  stackscript: 'StackScripts',
  volume: 'Volumes',
  vpc: 'VPCs',
};

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
                    checked={entityIsAll(null)}
                    data-qa-permission-header="None"
                    name={`${entity}-select-all`}
                    onChange={entitySetAllTo(entity, null)}
                    value="null"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label style={{ marginLeft: -65, cursor: 'pointer' }}>
                  Read Only
                  <Radio
                    checked={entityIsAll('read_only')}
                    data-qa-permission-header="Read Only"
                    name={`${entity}-select-all`}
                    onChange={entitySetAllTo(entity, 'read_only')}
                    value="read_only"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label style={{ marginLeft: -73, cursor: 'pointer' }}>
                  Read-Write
                  <Radio
                    checked={entityIsAll('read_write')}
                    data-qa-permission-header="Read-Write"
                    name={`${entity}-select-all`}
                    onChange={entitySetAllTo(entity, 'read_write')}
                    value="read_write"
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
                <TableRow data-qa-specific-grant={grant.label} key={grant.id}>
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
                  <TableCell padding="checkbox" parentColumn="None">
                    <Radio
                      aria-label={`Disallow access for ${grant.label}`}
                      checked={grant.permissions === null}
                      data-qa-permission="None"
                      name={`${grant.id}-perms`}
                      onChange={setGrantTo(entity, idx, null)}
                      value="null"
                    />
                  </TableCell>
                  <TableCell padding="checkbox" parentColumn="Read Only">
                    <Radio
                      aria-label={`Allow read-only access for ${grant.label}`}
                      checked={grant.permissions === 'read_only'}
                      data-qa-permission="Read Only"
                      name={`${grant.id}-perms`}
                      onChange={setGrantTo(entity, idx, 'read_only')}
                      value="read_only"
                    />
                  </TableCell>
                  <TableCell padding="checkbox" parentColumn="Read-Write">
                    <Radio
                      aria-label={`Allow read-write access for ${grant.label}`}
                      checked={grant.permissions === 'read_write'}
                      data-qa-permission="Read-Write"
                      name={`${grant.id}-perms`}
                      onChange={setGrantTo(entity, idx, 'read_write')}
                      value="read_write"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </StyledGrantsTable>
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
