import { Hidden } from '@linode/ui';
import { TableCell, TableRow } from 'akamai-cds-react-components/Table';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { CONNECTION_POOL_LABEL_CELL_STYLES } from 'src/features/Databases/constants';
import { StyledActionMenuWrapper } from 'src/features/Databases/shared.styles';

import type { ConnectionPool } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  /** Status of the Database */
  databaseStatus: string;
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
  const { pool, onDelete, onEdit, databaseStatus } = props;
  const editDisabled = databaseStatus === 'provisioning';

  const connectionPoolActions: Action[] = [
    {
      onClick: () => onEdit(pool),
      title: 'Edit',
      disabled: editDisabled,
      tooltip: editDisabled
        ? 'Your Database Cluster is currently provisioning.'
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
      <Hidden smDown>
        <TableCell>
          {`${pool.mode.charAt(0).toUpperCase()}${pool.mode.slice(1)}`}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>{pool.size}</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {pool.username === null ? 'Reuse inbound user' : pool.username}
        </TableCell>
      </Hidden>
      <StyledActionMenuWrapper>
        <ActionMenu
          actionsList={connectionPoolActions}
          ariaLabel={`Action menu for connection pool ${pool.label}`}
        />
      </StyledActionMenuWrapper>
    </TableRow>
  );
};
