import { Box, CircleProgress, LinkButton, useTheme } from '@linode/ui';
import { Pagination } from 'akamai-cds-react-components';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React from 'react';

import type { Account, UserType } from '@linode/api-v4';

interface ChildAccountsTableProps {
  childAccounts?: Account[];
  currentTokenWithBearer?: string;
  isLoading: boolean;
  isSwitchingChildAccounts: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSwitchAccount: ({
    currentTokenWithBearer,
    euuid,
    event,
    onClose,
    userType,
  }: {
    currentTokenWithBearer?: string;
    euuid: string;
    event: React.MouseEvent<HTMLElement>;
    onClose: (e: React.SyntheticEvent<HTMLElement>) => void;
    userType: undefined | UserType;
  }) => void;
  page: number;
  pageSize: number;
  setIsSwitchingChildAccounts: (value: boolean) => void;
  totalResults: number;
  userType: undefined | UserType;
}

export const ChildAccountsTable = (props: ChildAccountsTableProps) => {
  const {
    childAccounts,
    currentTokenWithBearer,
    isLoading,
    isSwitchingChildAccounts,
    onClose,
    onSwitchAccount,
    setIsSwitchingChildAccounts,
    userType,
    page,
    pageSize,
    totalResults,
    onPageChange,
    onPageSizeChange,
  } = props;

  const theme = useTheme();
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircleProgress size="md" />
      </Box>
    );
  }

  return (
    <>
      <Table aria-label="List of Child Accounts">
        <TableBody>
          {childAccounts?.map((childAccount, idx) => (
            <TableRow key={childAccount.euuid}>
              <TableCell style={{ paddingLeft: 0 }}>
                <LinkButton
                  disabled={isSwitchingChildAccounts}
                  key={`child-account-link-button-${idx}`}
                  onClick={(event) => {
                    setIsSwitchingChildAccounts(true);
                    onSwitchAccount({
                      currentTokenWithBearer,
                      euuid: childAccount.euuid,
                      event,
                      onClose,
                      userType,
                    });
                  }}
                >
                  {childAccount.company}
                </LinkButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalResults > pageSize && (
        <Pagination
          count={totalResults}
          onPageChange={(e: CustomEvent<number>) =>
            handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => handlePageSizeChange(Number(e.detail.pageSize))}
          page={page}
          pageSize={pageSize}
          pageSizes={[25, 50, 75, 100]}
          style={{ marginTop: theme.spacingFunction(12) }}
        />
      )}
    </>
  );
};
