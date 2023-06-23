import React from 'react';
import { Grant, GrantLevel, GrantType } from '@linode/api-v4/lib/account';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableCell } from 'src/components/TableCell';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { usePagination } from 'src/hooks/usePagination';
import { createDisplayPage } from 'src/components/Paginate';
import Typography from 'src/components/core/Typography';

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
};

interface Props {
  entity: GrantType;
  grants: Grant[] | undefined;
  setGrantTo: (entity: string, idx: number, value: GrantLevel) => () => void;
  entitySetAllTo: (entity: GrantType, value: GrantLevel) => () => void;
  showHeading?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  grantTable: {
    '& td': {
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 0,
        paddingRight: '0 !important',
      },
      width: '100%',
    },
    '& th': {
      minWidth: 150,
      width: '25%',
    },
  },
  label: {
    '& div': {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  },
  section: {
    marginTop: theme.spacing(2),
    paddingBottom: 0,
  },
  selectAll: {
    cursor: 'pointer',
  },
  setAll: {
    '& .react-select__menu, & .input': {
      marginLeft: theme.spacing(1),
      right: 0,
      textAlign: 'left',
      width: 125,
    },
    '& .react-select__menu-list': {
      width: '100%',
    },
    '& > div': {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    '& label': {
      marginTop: 6,
    },
  },
  tableSubheading: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
}));

export const UserPermissionsEntitySection = React.memo((props: Props) => {
  const { entity, entitySetAllTo, grants, setGrantTo, showHeading } = props;
  const classes = useStyles();

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
    <div key={entity} className={classes.section}>
      {showHeading && (
        <Typography
          variant="h3"
          className={classes.tableSubheading}
          data-qa-permissions-header={entity}
        >
          {entityNameMap[entity]}
        </Typography>
      )}
      <Table
        aria-label="User Permissions"
        className={classes.grantTable}
        noBorder
      >
        <TableHead data-qa-table-head>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell padding="checkbox">
              {/* eslint-disable-next-line */}
              <label className={classes.selectAll} style={{ marginLeft: -35 }}>
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
              <label className={classes.selectAll} style={{ marginLeft: -65 }}>
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
              <label className={classes.selectAll} style={{ marginLeft: -73 }}>
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
                <TableCell className={classes.label} parentColumn="Label">
                  {grant.label}
                </TableCell>
                <TableCell parentColumn="None" padding="checkbox">
                  <Radio
                    name={`${grant.id}-perms`}
                    checked={grant.permissions === null}
                    value="null"
                    onChange={setGrantTo(entity, idx, null)}
                    data-qa-permission="None"
                  />
                </TableCell>
                <TableCell parentColumn="Read Only" padding="checkbox">
                  <Radio
                    name={`${grant.id}-perms`}
                    checked={grant.permissions === 'read_only'}
                    value="read_only"
                    onChange={setGrantTo(entity, idx, 'read_only')}
                    data-qa-permission="Read Only"
                  />
                </TableCell>
                <TableCell parentColumn="Read-Write" padding="checkbox">
                  <Radio
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
      </Table>
      <PaginationFooter
        count={grants.length}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory={`User Permissions for ${entity}`}
      />
    </div>
  );
});
