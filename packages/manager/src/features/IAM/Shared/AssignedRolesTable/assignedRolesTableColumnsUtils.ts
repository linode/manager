import type { CSSProperties } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface AssignedRolesTableColumnWidths {
  actions: string;
  entities: string;
  role: string;
}

const ASSIGNED_ROLES_TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

export const getAssignedRolesTableCellStyle = (
  width: string,
  { shrinkable = false }: { shrinkable?: boolean } = {}
): CSSProperties => ({
  ...ASSIGNED_ROLES_TABLE_CELL_BASE_STYLE,
  flex: shrinkable ? `1 1 ${width}` : `0 0 ${width}`,
  minWidth: shrinkable ? 0 : width,
});

export const getAssignedRolesTableColumnWidths = ({
  isLGUp,
  isMDUp,
  isSMUp,
}: {
  isLGUp: boolean;
  isMDUp: boolean;
  isSMUp: boolean;
}): AssignedRolesTableColumnWidths => {
  if (isLGUp) {
    return {
      actions: '5%',
      entities: '70%',
      role: '25%',
    };
  }

  if (isMDUp) {
    return {
      actions: '6%',
      entities: '64%',
      role: '30%',
    };
  }

  if (isSMUp) {
    return {
      actions: '8%',
      entities: '52%',
      role: '40%',
    };
  }

  return {
    actions: '10%',
    entities: '0%',
    role: '90%',
  };
};

export const useAssignedRolesTableColumns = () => {
  const isSMUp = useBreakpoint('up', 'sm');
  const isMDUp = useBreakpoint('up', 'md');
  const isLGUp = useBreakpoint('up', 'lg');
  const showEntities = isSMUp;

  const columnWidths = getAssignedRolesTableColumnWidths({
    isLGUp,
    isMDUp,
    isSMUp,
  });

  return {
    columnWidths,
    showEntities,
  };
};
