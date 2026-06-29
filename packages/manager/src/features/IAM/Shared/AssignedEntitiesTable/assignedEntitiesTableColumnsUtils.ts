import type { CSSProperties } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface AssignedEntitiesTableColumnWidths {
  actions: string;
  entity: string;
  entityType: string;
  role: string;
}

const ASSIGNED_ENTITIES_TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

export const getAssignedEntitiesTableCellStyle = (
  width: string
): CSSProperties => ({
  ...ASSIGNED_ENTITIES_TABLE_CELL_BASE_STYLE,
  flex: `0 0 ${width}`,
  minWidth: width,
});

export const getAssignedEntitiesTableColumnWidths = ({
  isSMUp,
}: {
  isSMUp: boolean;
}): AssignedEntitiesTableColumnWidths => {
  if (!isSMUp) {
    return {
      actions: '15%',
      entity: '85%',
      entityType: '0%',
      role: '0%',
    };
  }

  return {
    actions: '10%',
    entity: '35%',
    entityType: '30%',
    role: '25%',
  };
};

export const useAssignedEntitiesTableColumns = () => {
  const isSMUp = useBreakpoint('up', 'sm');
  const showEntityType = isSMUp;
  const showRole = isSMUp;

  const columnWidths = getAssignedEntitiesTableColumnWidths({ isSMUp });

  return {
    columnWidths,
    showEntityType,
    showRole,
  };
};
