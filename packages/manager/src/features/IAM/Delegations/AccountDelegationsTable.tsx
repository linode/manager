import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { CircleProgress } from '../Shared/CircleProgress/CircleProgress';
import { NO_ITEMS_TO_DISPLAY_TEXT } from '../Shared/constants';
import { ErrorState } from '../Shared/ErrorState/ErrorState';
import {
  getAccountDelegationsTableCellStyle,
  useAccountDelegationsTableColumns,
} from './accountDelegationsTableColumnsUtils';
import { AccountDelegationsTableRow } from './AccountDelegationsTableRow';
import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { IAMAction } from '../routes';
import type {
  APIError,
  ChildAccount,
  ChildAccountWithDelegates,
} from '@linode/api-v4';

interface Props {
  delegations: ChildAccount[] | ChildAccountWithDelegates[] | undefined;
  error: APIError[] | null;
  handleOrderChange: (key: string, order?: 'asc' | 'desc') => void;
  isLoading: boolean;
  order: 'asc' | 'desc';
  orderBy: string;
}

const DELEGATIONS_ROUTE = '/iam/delegations';
const UPDATE_DELEGATION_ACTION: IAMAction = 'update-delegation';

export const AccountDelegationsTable = ({
  delegations,
  error,
  handleOrderChange,
  isLoading,
  order,
  orderBy,
}: Props) => {
  const { columnWidths, showUsers } = useAccountDelegationsTableColumns();
  const navigate = useNavigate();
  const { action, euuid } = useSearch({
    from: DELEGATIONS_ROUTE,
  });

  const updateDelegation = React.useMemo(
    () =>
      euuid
        ? delegations?.find((delegation) => delegation.euuid === euuid)
        : undefined,
    [euuid, delegations]
  );

  const actionHandler = (action: IAMAction, euuid?: string) => {
    navigate({
      to: DELEGATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action,
        euuid,
      }),
    });
  };

  const closeDrawer = (expectedAction: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: DELEGATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action: undefined,
        euuid: undefined,
      }),
    });
  };

  return (
    <>
      <Table aria-label="List of Account Delegations">
        <TableHead
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          <TableRow
            headerbackground="var(--token-component-table-header-nested-background)"
            headerborder
          >
            <TableHeaderCell
              onSort={() =>
                handleOrderChange('company', order === 'asc' ? 'desc' : 'asc')
              }
              sortable
              sorted={orderBy === 'company' ? order : undefined}
              style={getAccountDelegationsTableCellStyle(columnWidths.account)}
            >
              Account
            </TableHeaderCell>
            {showUsers ? (
              <TableHeaderCell
                style={getAccountDelegationsTableCellStyle(columnWidths.users, {
                  shrinkable: true,
                })}
              >
                Users
              </TableHeaderCell>
            ) : null}
            <TableHeaderCell
              style={getAccountDelegationsTableCellStyle(columnWidths.actions)}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell style={{ height: 100 }}>
                <CircleProgress size="large" />
              </TableCell>
            </TableRow>
          )}
          {error && (
            <TableRow>
              <TableCell style={{ justifyContent: 'center' }}>
                <div style={{ margin: '0 auto' }}>
                  <ErrorState errorText={error[0]?.reason} />
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            !error &&
            (!delegations || delegations.length === 0) && (
              <TableRow>
                <TableCell>
                  <p style={{ textAlign: 'center', width: '100%' }}>
                    {NO_ITEMS_TO_DISPLAY_TEXT}
                  </p>
                </TableCell>
              </TableRow>
            )}
          {!isLoading &&
            !error &&
            delegations &&
            delegations.length > 0 &&
            delegations.map((delegation, index) => (
              <AccountDelegationsTableRow
                delegation={delegation}
                index={index}
                key={`delegation-${delegation.euuid}-${index}`}
                onUpdateDelegations={(delegation) => {
                  actionHandler(UPDATE_DELEGATION_ACTION, delegation.euuid);
                }}
              />
            ))}
        </TableBody>
      </Table>
      <UpdateDelegationsDrawer
        delegation={updateDelegation}
        isDelegationsLoading={isLoading}
        onClose={() => closeDrawer(UPDATE_DELEGATION_ACTION)}
        open={action === UPDATE_DELEGATION_ACTION}
      />
    </>
  );
};
