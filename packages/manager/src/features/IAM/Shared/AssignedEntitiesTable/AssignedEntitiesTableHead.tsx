import {
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import React from 'react';

import {
  getAssignedEntitiesTableCellStyle,
  useAssignedEntitiesTableColumns,
} from './assignedEntitiesTableColumnsUtils';

type SortOrder = 'asc' | 'desc';

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

interface Props {
  handleOrderChange: (key: string, order?: SortOrder | undefined) => void;
  order: SortOrder;
  orderBy: OrderByKeys;
}

export const AssignedEntitiesTableHead = ({
  handleOrderChange,
  order,
  orderBy,
}: Props) => {
  const { columnWidths, showEntityType, showRole } =
    useAssignedEntitiesTableColumns();

  return (
    <TableHead>
      <TableRow
        headerbackground="var(--token-component-table-header-nested-background)"
        headerborder
      >
        <TableHeaderCell
          onSort={() =>
            handleOrderChange('entity_name', order === 'asc' ? 'desc' : 'asc')
          }
          sortable
          sorted={orderBy === 'entity_name' ? order : undefined}
          style={getAssignedEntitiesTableCellStyle(columnWidths.entity)}
        >
          Entity
        </TableHeaderCell>
        {showEntityType && (
          <TableHeaderCell
            onSort={() =>
              handleOrderChange('entity_type', order === 'asc' ? 'desc' : 'asc')
            }
            sortable
            sorted={orderBy === 'entity_type' ? order : undefined}
            style={getAssignedEntitiesTableCellStyle(columnWidths.entityType)}
          >
            Entity Type
          </TableHeaderCell>
        )}
        {showRole && (
          <TableHeaderCell
            onSort={() =>
              handleOrderChange('role_name', order === 'asc' ? 'desc' : 'asc')
            }
            sortable
            sorted={orderBy === 'role_name' ? order : undefined}
            style={getAssignedEntitiesTableCellStyle(columnWidths.role)}
          >
            Assigned Role
          </TableHeaderCell>
        )}
        <TableHeaderCell
          style={getAssignedEntitiesTableCellStyle(columnWidths.actions)}
        />
      </TableRow>
    </TableHead>
  );
};
