import { TableCell, TableRow } from '@akamai/cds-components/react';
import * as React from 'react';

import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { AccountUserRow } from './AccountUserRow';

import type { TableRowData } from './AccountUsersTable.utilities';

export const AccountUsersTableBody = ({
  disabled,
  errorText,
  isLoading,
  loadingLabel,
  onToggle,
  selectedUsersSet,
  showNoUsersText,
  tableRows,
}: {
  disabled?: boolean;
  errorText?: string;
  isLoading: boolean;
  loadingLabel: string;
  onToggle: (value: string, checked: boolean) => void;
  selectedUsersSet: Set<string>;
  showNoUsersText: boolean;
  tableRows: TableRowData[];
}) => {
  if (errorText) {
    return (
      <TableRow>
        <TableCell style={{ justifyContent: 'center' }}>
          <p style={{ margin: '0 auto' }}>{errorText}</p>
        </TableCell>
      </TableRow>
    );
  }

  if (isLoading) {
    return (
      <TableRow>
        <TableCell style={{ justifyContent: 'center' }}>
          <CircleProgress label={loadingLabel} />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {tableRows.map((p) => (
        <AccountUserRow
          checked={selectedUsersSet.has(p.option.value)}
          disabled={disabled}
          email={p.email}
          key={p.rank}
          onToggle={(checked) => onToggle(p.option.value, checked)}
          username={p.name}
        />
      ))}
      {showNoUsersText && (
        <TableRow>
          <TableCell style={{ justifyContent: 'center' }}>
            <p style={{ margin: '0 auto' }}>No users found</p>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

