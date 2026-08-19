import { Icon, Menu, MenuItem, Tooltip } from '@akamai/cds-components/react';
import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { CONNECTION_POOL_LABEL_CELL_STYLES } from 'src/features/Databases/constants';
import { useBreakpoint } from 'src/features/Databases/hooks/useBreakpoint';
import { StyledActionMenuWrapper } from 'src/features/Databases/shared.styles';

import type { Action } from '../../shared/types';
import type { ConnectionPool, DatabaseStatus } from '@linode/api-v4';

interface Props {
  /** Status of the Database */
  databaseStatus: DatabaseStatus;
  /**
   * Function called when the delete button in the Action Menu is pressed.
   */
  onDelete: (pool: ConnectionPool) => void;
  /**
   * Function called when the edit button in the Action Menu is pressed.
   */
  onEdit: (pool: ConnectionPool) => void;
  /**
   * Payment method type and data.
   */
  pool: ConnectionPool;
}

export const DatabaseConnectionPoolRow = (props: Props) => {
  const showFromSmUp = useBreakpoint('up', 'sm');
  const { pool, onDelete, onEdit, databaseStatus } = props;
  const editDisabled = databaseStatus !== 'active';

  const connectionPoolActions: Action[] = [
    {
      onClick: () => onEdit(pool),
      title: 'Edit',
      disabled: editDisabled,
      tooltip: editDisabled
        ? 'You can only edit connection pools on active database clusters'
        : '',
    },
    {
      onClick: () => onDelete(pool),
      title: 'Delete',
    },
  ];

  return (
    <TableRow hoverable zebra>
      <TableCell style={CONNECTION_POOL_LABEL_CELL_STYLES}>
        {pool.label}
      </TableCell>
      {showFromSmUp && (
        <TableCell>
          {`${pool.mode.charAt(0).toUpperCase()}${pool.mode.slice(1)}`}
        </TableCell>
      )}
      {showFromSmUp && <TableCell>{pool.size}</TableCell>}
      {showFromSmUp && (
        <TableCell>
          {pool.username === null ? 'Reuse inbound user' : pool.username}
        </TableCell>
      )}
      <StyledActionMenuWrapper>
        <Menu
          aria-label={`Action menu for connection pool ${pool.label}`}
          icon="actions"
          position="bottom-right"
        >
          {connectionPoolActions.map((action) => (
            <MenuItem
              disabled={action.disabled}
              key={action.title}
              onSelected={action.onClick}
              style={{
                minWidth: '210px',
                paddingRight: Spacing.S4,
              }}
              title={action.title}
              value={action.title}
            >
              <span
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'space-between',
                  minWidth: '210px',
                }}
              >
                {action.title}
                {action.disabled && action.tooltip ? (
                  <Tooltip
                    disabled={!action.disabled}
                    key={action.title}
                    noArrow={true}
                    style={{ textAlign: 'left', whiteSpace: 'normal' }}
                    tooltipPlacement="left"
                    tooltipText={action.tooltip}
                  >
                    <Icon icon="info-outline" size="m" />
                  </Tooltip>
                ) : null}
              </span>
            </MenuItem>
          ))}
        </Menu>
      </StyledActionMenuWrapper>
    </TableRow>
  );
};
