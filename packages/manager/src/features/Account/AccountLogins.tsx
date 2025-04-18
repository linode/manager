import { useAccountLoginsQuery, useProfile } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

import AccountLoginsTableRow from './AccountLoginsTableRow';
import { getRestrictedResourceText } from './utils';

import type { AccountLogin } from '@linode/api-v4/lib/account/types';
import type { Theme } from '@mui/material/styles';

const preferenceKey = 'account-logins';

const useStyles = makeStyles()((theme: Theme) => ({
  cell: {
    width: '12%',
  },
  copy: {
    lineHeight: '20px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
  },
}));

const AccountLogins = () => {
  const { classes } = useStyles();
  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'datetime',
    },
    `${preferenceKey}-order}`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data, error, isLoading } = useAccountLoginsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );
  const { data: profile } = useProfile();
  const isChildUser = profile?.user_type === 'child';
  const isAccountAccessRestricted = profile?.restricted;

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          responsive={{
            2: { smDown: true },
            3: { mdDown: true },
          }}
          columns={5}
          rows={1}
        />
      );
    }
    if (error) {
      return <TableRowError colSpan={5} message={error[0].reason} />;
    }
    if (data?.results == 0) {
      return <TableRowEmpty colSpan={5} message="No account logins" />;
    }
    if (data) {
      return data.data.map((item: AccountLogin) => (
        <AccountLoginsTableRow key={item.id} {...item} />
      ));
    }

    return null;
  };

  return !isAccountAccessRestricted ? (
    <>
      <DocumentTitleSegment segment="Login History" />
      <Typography className={classes.copy} variant="body1">
        Logins across all users on your account over the last 90 days.
      </Typography>
      <Table aria-label="Account Logins">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'datetime'}
              className={classes.cell}
              direction={order}
              handleClick={handleOrderChange}
              label="datetime"
            >
              Date
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'username'}
              className={classes.cell}
              direction={order}
              handleClick={handleOrderChange}
              label="username"
            >
              Username
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'ip'}
                className={classes.cell}
                direction={order}
                handleClick={handleOrderChange}
                label="ip"
              >
                IP
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell className={classes.cell}>Permission Level</TableCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'status'}
              className={classes.cell}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Access
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results || 0}
        eventCategory="Account Logins Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  ) : (
    <Notice
      text={getRestrictedResourceText({
        isChildUser,
        resourceType: 'Account',
      })}
      variant="warning"
    />
  );
};

export default AccountLogins;
