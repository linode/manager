import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useFlags } from 'src/hooks/useFlags';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

export const UserDelegations = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const flags = useFlags();
  const isIAMDelegationEnabled = flags?.iamDelegation?.enabled;
  const [search, setSearch] = React.useState('');

  const pagination = usePaginationV2({
    currentRoute: '/iam/users/$username/delegations',
    initialPage: 1,
    preferenceKey: 'delegated-child-accounts',
  });

  const {
    data: delegatedChildAccounts,
    isLoading,
    error,
  } = useGetDelegatedChildAccountsForUserQuery({
    username,
  });

  if (!isIAMDelegationEnabled) {
    return null;
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <Paper>
      <Stack>
        <Typography variant="h2">Account Delegations</Typography>
        <DebouncedSearchTextField
          debounceTime={250}
          hideLabel
          label="Search"
          onSearch={(e) => {
            setSearch(e);
          }}
          placeholder="Search"
          sx={{ mt: 3 }}
          value={search}
        />
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {delegatedChildAccounts?.results === 0 && (
              <TableRowEmpty colSpan={1} message="No accounts found" />
            )}
            {delegatedChildAccounts?.data.map((childAccount) => (
              <TableRow key={childAccount.euuid}>
                <TableCell>{childAccount.company}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationFooter
          count={delegatedChildAccounts?.results ?? 0}
          eventCategory="delegated child accounts"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Stack>
    </Paper>
  );
};
