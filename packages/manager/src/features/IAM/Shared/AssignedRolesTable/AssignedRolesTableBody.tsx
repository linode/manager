import {
  TableCell,
  TableRow,
  TableRowExpanded,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import React from 'react';

import { AssignedEntities } from '../../Users/UserRoles/AssignedEntities';
import { ROLES_LEARN_MORE_LINK } from '../constants';
import { Link } from '../Link/Link';
import { Permissions } from '../Permissions/Permissions';
import { getFacadeRoleDescription, getFormattedEntityType } from '../utilities';
import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';
import {
  getAssignedRolesTableCellStyle,
  useAssignedRolesTableColumns,
} from './assignedRolesTableColumnsUtils';

import type { CombinedEntity, ExtendedRoleView } from '../types';
import type {
  AccountRoleType,
  EntityRoleType,
  PickPermissions,
} from '@linode/api-v4';

type RolesActionsPermissions = PickPermissions<
  'is_account_admin' | 'update_default_delegate_access'
>;

interface Props {
  handleChangeRole: (role: ExtendedRoleView) => void;
  handleRemoveAssignment: (
    entity: CombinedEntity,
    role: ExtendedRoleView
  ) => void;
  handleUnassignRole: (role: ExtendedRoleView) => void;
  handleUpdateEntities: (role: ExtendedRoleView) => void;
  handleViewEntities: (roleName: AccountRoleType | EntityRoleType) => void;
  paginatedData: ExtendedRoleView[];
  permissions: Record<RolesActionsPermissions, boolean>;
}

export const AssignedRolesTableBody = ({
  handleChangeRole,
  handleRemoveAssignment,
  handleUnassignRole,
  handleUpdateEntities,
  handleViewEntities,
  paginatedData,
  permissions,
}: Props) => {
  const { columnWidths, showEntities } = useAssignedRolesTableColumns();

  const fullWidthCellStyle = getAssignedRolesTableCellStyle('100%');

  if (!paginatedData.length) {
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
      {paginatedData.map((role) => (
        <TableRow expandable hoverable key={role.id} rowborder>
          <TableCell style={getAssignedRolesTableCellStyle(columnWidths.role)}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role.name}
            </span>
          </TableCell>
          {showEntities &&
            (role.access === 'account_access' ? (
              <TableCell
                style={getAssignedRolesTableCellStyle(columnWidths.entities)}
              >
                <p>
                  {role.entity_type === 'account'
                    ? 'All Entities'
                    : `All ${getFormattedEntityType(role.entity_type)}s`}
                </p>
              </TableCell>
            ) : (
              <TableCell
                style={getAssignedRolesTableCellStyle(columnWidths.entities, {
                  shrinkable: true,
                })}
              >
                <AssignedEntities
                  disabled={!permissions.is_account_admin}
                  onButtonClick={handleViewEntities}
                  onRemoveAssignment={handleRemoveAssignment}
                  role={role}
                />
              </TableCell>
            ))}
          <TableCell
            style={{
              ...getAssignedRolesTableCellStyle(columnWidths.actions),
              justifyContent: 'flex-end',
            }}
          >
            <AssignedRolesActionMenu
              handleChangeRole={handleChangeRole}
              handleUnassignRole={handleUnassignRole}
              handleUpdateEntities={handleUpdateEntities}
              handleViewEntities={handleViewEntities}
              permissions={permissions}
              role={role}
            />
          </TableCell>
          <TableRowExpanded
            slot="expanded"
            style={{
              marginBottom: Spacing.S12,
              marginLeft: Spacing.S4,
              padding: `0 ${Spacing.S4}`,
              width: '100%',
            }}
          >
            <div
              style={{
                padding: `${Spacing.S0} ${Spacing.S16}`,
                boxSizing: 'border-box',
              }}
            >
              <p
                style={{
                  font: Typography.Label.Bold.S,
                  marginBottom: Spacing.S4,
                }}
              >
                Description
              </p>
              <p style={{ marginBottom: Spacing.S8 }}>
                {role.permissions.length ? (
                  role.description
                ) : (
                  <>
                    {getFacadeRoleDescription(role)}{' '}
                    <Link to={ROLES_LEARN_MORE_LINK}>Learn more</Link>.
                  </>
                )}
              </p>
              <Permissions permissions={role.permissions} />
            </div>
          </TableRowExpanded>
        </TableRow>
      ))}
    </>
  );
};
