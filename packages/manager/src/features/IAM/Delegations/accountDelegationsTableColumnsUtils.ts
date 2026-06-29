import type { CSSProperties } from 'react';

import { useBreakpoint } from '../hooks/useBreakpoint';

export interface AccountDelegationsTableColumnWidths {
  account: string;
  actions: string;
  users: string;
}

const ACCOUNT_DELEGATIONS_TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

/**
 * CDS table rows are flex containers; header and body cells must share the same
 * flex + minWidth so columns line up. Use `shrinkable` for cells that truncate
 * inline content (e.g. delegate users).
 */
export const getAccountDelegationsTableCellStyle = (
  width: string,
  { shrinkable = false }: { shrinkable?: boolean } = {}
): CSSProperties => ({
  ...ACCOUNT_DELEGATIONS_TABLE_CELL_BASE_STYLE,
  flex: shrinkable ? `1 1 ${width}` : `0 0 ${width}`,
  minWidth: shrinkable ? 0 : width,
});

/**
 * Column width percentages for the account delegations table.
 * Percentages must sum to 100% for the visible column set.
 */
export const getAccountDelegationsColumnWidths = ({
  isSMUp,
}: {
  isSMUp: boolean;
}): AccountDelegationsTableColumnWidths => {
  if (!isSMUp) {
    return {
      account: '70%',
      actions: '14%',
      users: '0%',
    };
  }

  return {
    account: '27%',
    actions: '14%',
    users: '59%',
  };
};

export const useAccountDelegationsTableColumns = () => {
  const isSMUp = useBreakpoint('up', 'sm');
  const showUsers = isSMUp;
  const columnWidths = getAccountDelegationsColumnWidths({ isSMUp });

  return {
    columnWidths,
    showUsers,
  };
};
