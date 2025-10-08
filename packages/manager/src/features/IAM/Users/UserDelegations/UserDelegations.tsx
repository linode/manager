import { useAllGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
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
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import type { Theme } from '@mui/material';

export const UserDelegations = () => {
  const { username } = useParams({ from: '/iam/users/$username' });

  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const [search, setSearch] = React.useState('');

  // TODO: UIE-9298 - Replace with API filtering
  const {
    data: allDelegatedChildAccounts,
    isLoading: allDelegatedChildAccountsLoading,
    error: allDelegatedChildAccountsError,
  } = useAllGetDelegatedChildAccountsForUserQuery({
    username,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const childAccounts = React.useMemo(() => {
    if (!allDelegatedChildAccounts) {
      return [];
    }

    if (search.length === 0) {
      return allDelegatedChildAccounts;
    }

    return allDelegatedChildAccounts.filter((childAccount) =>
      childAccount.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [allDelegatedChildAccounts, search]);

  if (!isIAMDelegationEnabled) {
    return null;
  }

  if (allDelegatedChildAccountsLoading) {
    return <CircleProgress />;
  }

  if (allDelegatedChildAccountsError) {
    return <ErrorState errorText={allDelegatedChildAccountsError[0].reason} />;
  }

  return (
    <Paper>
      <Stack>
        <Typography variant="h2">Account Delegations</Typography>
        <DebouncedSearchTextField
          debounceTime={250}
          hideLabel
          isSearching={allDelegatedChildAccountsLoading}
          label="Search"
          onSearch={handleSearch}
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
            {childAccounts?.length === 0 && (
              <TableRowEmpty colSpan={1} message="No accounts found" />
            )}
            <Paginate data={childAccounts} pageSize={25}>
              {({
                count,
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize,
              }) => (
                <>
                  {paginatedData?.map((childAccount) => (
                    <TableRow key={childAccount.euuid}>
                      <TableCell>{childAccount.company}</TableCell>
                    </TableRow>
                  ))}
                  {count > 25 && (
                    <TableRow>
                      <TableCell
                        colSpan={1}
                        sx={(theme: Theme) => ({
                          padding: 0,
                          '& > div': {
                            border: 'none',
                            borderTop: `1px solid ${theme.borderColors.divider}`,
                          },
                        })}
                      >
                        <PaginationFooter
                          count={count}
                          eventCategory="Delegated Child Accounts"
                          handlePageChange={handlePageChange}
                          handleSizeChange={handlePageSizeChange}
                          page={page}
                          pageSize={pageSize}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </Paginate>
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
};
