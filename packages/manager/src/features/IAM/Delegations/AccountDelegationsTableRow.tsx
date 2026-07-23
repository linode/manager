import { TableCell, TableRow } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useHasTableStripingEnabled } from '../hooks/useHasTableStripingEnabled';
import { usePermissions } from '../hooks/usePermissions';
import { IAM_PARENT_USERS_PENDO_IDS } from '../Shared/constants';
import { InlineMenuAction } from '../Shared/InlineMenuAction/InlineMenuAction';
import {
  getAccountDelegationsTableCellStyle,
  useAccountDelegationsTableColumns,
} from './accountDelegationsTableColumnsUtils';
import { DelegatedUsersList } from './DelegatedUsersList';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates;
  index: number;
  onUpdateDelegations: (
    delegation: ChildAccount | ChildAccountWithDelegates
  ) => void;
}

export const AccountDelegationsTableRow = ({
  delegation,
  index,
  onUpdateDelegations,
}: Props) => {
  const { columnWidths, showUsers } = useAccountDelegationsTableColumns();
  const hasTableStripingEnabled = useHasTableStripingEnabled();

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);

  return (
    <TableRow
      data-qa-table-row={delegation.euuid}
      key={`delegation-${delegation.euuid}-${index}`}
      zebra={hasTableStripingEnabled}
    >
      <TableCell
        style={getAccountDelegationsTableCellStyle(columnWidths.account)}
      >
        <p
          style={{
            maxWidth: 272,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {delegation.company}
        </p>
      </TableCell>
      {showUsers ? (
        <TableCell
          style={getAccountDelegationsTableCellStyle(columnWidths.users, {
            shrinkable: true,
          })}
        >
          {'users' in delegation && delegation.users.length > 0 ? (
            <DelegatedUsersList
              onViewAll={() => onUpdateDelegations(delegation)}
              users={delegation.users}
            />
          ) : (
            <p
              style={{
                fontStyle: 'italic',
                textTransform: 'capitalize',
              }}
            >
              No Users Added
            </p>
          )}
        </TableCell>
      ) : null}
      <TableCell
        style={{
          ...getAccountDelegationsTableCellStyle(columnWidths.actions),
          paddingRight: Spacing.S0,
          textAlign: 'center',
        }}
      >
        <InlineMenuAction
          isActionDisabled={!permissions.update_delegate_users}
          label="Update Delegation"
          onClick={() => {
            onUpdateDelegations(delegation);
          }}
          pendoID={IAM_PARENT_USERS_PENDO_IDS.updateDelegation}
          tooltipText="You do not have permission to update delegations."
        />
      </TableCell>
    </TableRow>
  );
};
