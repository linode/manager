import { TableCell, TableRow } from '@akamai/cds-components/react';
import React from 'react';

import { CircleProgress } from '../CircleProgress/CircleProgress';
import { getFormattedEntityType } from '../utilities';
import { AssignedEntitiesActionMenu } from './AssignedEntitiesActionMenu';
import {
  getAssignedEntitiesTableCellStyle,
  useAssignedEntitiesTableColumns,
} from './assignedEntitiesTableColumnsUtils';

import type { EntitiesRole } from '../types';
import type { RolesActionsPermissions } from './AssignedEntitiesActionMenu';

interface Props {
  assignedRoles: unknown;
  entities: unknown;
  entitiesError: unknown;
  entitiesLoading: boolean;
  error: unknown;
  filteredRoles: EntitiesRole[];
  handleChangeRole: (role: EntitiesRole) => void;
  handleRemoveAssignment: (role: EntitiesRole) => void;
  loading: boolean;
  paginatedData: EntitiesRole[];
  permissions: Record<RolesActionsPermissions, boolean>;
}

export const AssignedEntitiesTableBody = ({
  assignedRoles,
  entities,
  entitiesError,
  entitiesLoading,
  error,
  filteredRoles,
  handleChangeRole,
  handleRemoveAssignment,
  loading,
  paginatedData,
  permissions,
}: Props) => {
  const { columnWidths, showEntityType, showRole } =
    useAssignedEntitiesTableColumns();

  const fullWidthCellStyle = getAssignedEntitiesTableCellStyle('100%');

  if (entitiesLoading || loading) {
    return (
      <TableRow
        aria-label="Table content is loading"
        data-testid="table-row-loading"
      >
        <TableCell style={{ ...fullWidthCellStyle, height: 60 }}>
          <CircleProgress size="medium" />
        </TableCell>
      </TableRow>
    );
  }

  if (entitiesError || error) {
    return (
      <TableRow data-testid="table-row-error">
        <TableCell style={{ ...fullWidthCellStyle, textAlign: 'center' }}>
          <p style={{ width: '100%' }}>
            Unable to load the assigned entities. Please try again.
          </p>
        </TableCell>
      </TableRow>
    );
  }

  if (!entities || !assignedRoles || filteredRoles.length === 0) {
    return (
      <TableRow data-testid="table-row-empty">
        <TableCell style={{ ...fullWidthCellStyle, textAlign: 'center' }}>
          <p style={{ width: '100%' }}>No items to display.</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {paginatedData.map((el) => (
        <TableRow key={el.id} zebra>
          <TableCell
            style={getAssignedEntitiesTableCellStyle(columnWidths.entity)}
          >
            <p>{el.entity_name}</p>
          </TableCell>
          {showEntityType && (
            <TableCell
              style={getAssignedEntitiesTableCellStyle(columnWidths.entityType)}
            >
              <p>{getFormattedEntityType(el.entity_type)}</p>
            </TableCell>
          )}
          {showRole && (
            <TableCell
              style={getAssignedEntitiesTableCellStyle(columnWidths.role)}
            >
              <p>{el.role_name}</p>
            </TableCell>
          )}
          <TableCell
            style={getAssignedEntitiesTableCellStyle(columnWidths.actions)}
          >
            <AssignedEntitiesActionMenu
              assignment={el}
              handleChangeRole={handleChangeRole}
              handleRemoveAssignment={handleRemoveAssignment}
              permissions={permissions}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
