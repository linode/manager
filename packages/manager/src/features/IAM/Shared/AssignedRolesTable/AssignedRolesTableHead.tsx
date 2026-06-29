import {
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import React from 'react';

import {
  getAssignedRolesTableCellStyle,
  useAssignedRolesTableColumns,
} from './assignedRolesTableColumnsUtils';

type SortOrder = 'asc' | 'desc';

type OrderByKeys = 'name';

interface Props {
  handleOrderChange: (orderBy: OrderByKeys) => void;
  order: SortOrder;
  orderBy: OrderByKeys;
}

export const AssignedRolesTableHead = ({
  handleOrderChange,
  order,
  orderBy,
}: Props) => {
  const { columnWidths, showEntities } = useAssignedRolesTableColumns();

  return (
    <TableHead>
      <TableRow
        headerbackground="var(--token-component-table-header-nested-background)"
        headerborder
      >
        <TableHeaderCell
          onSort={() => handleOrderChange('name')}
          sortable
          sorted={orderBy === 'name' ? order : undefined}
          style={getAssignedRolesTableCellStyle(columnWidths.role)}
        >
          Role
        </TableHeaderCell>
        {showEntities && (
          <TableHeaderCell
            style={getAssignedRolesTableCellStyle(columnWidths.entities, {
              shrinkable: true,
            })}
          >
            Entities
          </TableHeaderCell>
        )}
        <TableHeaderCell
          style={getAssignedRolesTableCellStyle(columnWidths.actions)}
        />
      </TableRow>
    </TableHead>
  );
};
