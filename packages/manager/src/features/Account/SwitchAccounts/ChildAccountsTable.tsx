import { LinkButton } from '@linode/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React from 'react';

import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import type { Account, Filter, UserType } from '@linode/api-v4';

interface ChildAccountsTableProps {
  childAccounts?: Account[];
  currentTokenWithBearer?: string;
  errors: {
    allChildAccountsError: Error | null;
    childAccountInfiniteError: boolean;
  };
  filter: Filter;
  isLoading: boolean;
  isSwitchingChildAccounts: boolean;
  onClose: () => void;
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
  refetchFn: () => void;
  setIsSwitchingChildAccounts: (value: boolean) => void;
  userType: undefined | UserType;
}

export const ChildAccountsTable = (props: ChildAccountsTableProps) => {
  const {
    childAccounts,
    currentTokenWithBearer,
    errors,
    isLoading,
    isSwitchingChildAccounts,
    onClose,
    onSwitchAccount,
    setIsSwitchingChildAccounts,
    userType,
  } = props;

  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(25);

  // const handlePageChange = (newPage: number) => {
  //   setPage(newPage);
  // };

  // const handlePageSizeChange = (newPageSize: number) => {
  //   setPageSize(newPageSize);
  //   setPage(1); // Reset to first page when page size changes
  // };

  // const startIndex = (page - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedAccounts = childAccounts?.slice(startIndex, endIndex) || [];
  // const totalCount = childAccounts?.length || 0;

  if (isLoading) {
    return <TableRowLoading columns={2} />;
  }

  if (errors.allChildAccountsError) {
    return (
      <TableRowError
        colSpan={2}
        message={errors.allChildAccountsError.message}
      />
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
      {/* {totalCount > pageSize && (
        <Pagination
          count={totalCount}
          onPageChange={(_, newPage) => handlePageChange(newPage)}
          onRowsPerPageChange={(event) =>
            handlePageSizeChange(parseInt(event.target.value, 10))
          }
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[25, 50, 100]}
        />
      )} */}
    </>
  );
};
