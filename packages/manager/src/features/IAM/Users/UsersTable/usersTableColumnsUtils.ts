import type { CSSProperties } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDelegationRole } from '../../hooks/useDelegationRole';

export interface UsersTableColumnWidths {
  actions: string;
  email: string;
  lastLogin: string;
  username: string;
  userType: string;
}

const USERS_TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

/**
 * CDS table rows are flex containers; header and body cells must share the same
 * flex + minWidth so columns line up. flexBasis alone allows uneven growth
 * (especially when widths do not sum to 100%).
 */
export const getUsersTableCellStyle = (width: string): CSSProperties => ({
  ...USERS_TABLE_CELL_BASE_STYLE,
  flex: `0 0 ${width}`,
  minWidth: width,
});

/**
 * Column width percentages for the IAM users landing table.
 * Percentages must sum to 100% for the visible column set.
 */
export const getUsersTableColumnWidths = ({
  showUserType,
  isLGUp,
  isSMUp,
}: {
  isLGUp: boolean;
  isSMUp: boolean;
  showUserType: boolean;
}): UsersTableColumnWidths => {
  if (!isSMUp) {
    return {
      actions: '10%',
      email: '0%',
      lastLogin: '0%',
      userType: '0%',
      username: '90%',
    };
  }

  if (!isLGUp) {
    return {
      actions: '10%',
      email: '40%',
      lastLogin: '0%',
      userType: '0%',
      username: '50%',
    };
  }

  if (showUserType) {
    return {
      actions: '10%',
      email: '20%',
      lastLogin: '15%',
      userType: '20%',
      username: '35%',
    };
  }

  return {
    actions: '10%',
    email: '25%',
    lastLogin: '20%',
    userType: '0%',
    username: '45%',
  };
};

export const useUsersTableColumns = () => {
  const { isChildUserType, isDelegateUserType } = useDelegationRole();
  const isSMUp = useBreakpoint('up', 'sm');
  const isLGUp = useBreakpoint('up', 'lg');

  const isChildOrDelegate = isChildUserType || isDelegateUserType;

  const showUserType = isChildOrDelegate && isLGUp;
  const showEmail = isSMUp;
  const showLastLogin = isLGUp;

  const columnWidths = getUsersTableColumnWidths({
    isLGUp,
    isSMUp,
    showUserType,
  });

  return {
    columnWidths,
    isChildOrDelegate,
    showEmail,
    showLastLogin,
    showUserType,
  };
};
