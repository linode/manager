import { Box } from '@linode/ui';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import { alertStatusToIconStatusMap, alertStatuses } from '../constants';
import { AlertActionMenu } from './AlertActionMenu';

import type { Item } from '../constants';
import type { ActionHandlers } from './AlertActionMenu';
import type { Alert, AlertServiceType } from '@linode/api-v4';

interface Props {
  /**
   * alert details used by the component to fill the row details
   */
  alert: Alert;
  /**
   * The callback handlers for clicking an action menu item like Show Details, Delete, etc.
   */
  handlers: ActionHandlers;
  /**
   * services list for the reverse mapping to display the labels from the alert service values
   */
  services: Item<string, AlertServiceType>[];
}

export const AlertTableRow = (props: Props) => {
  const { alert, handlers, services } = props;
  const location = useLocation();
  const {
    created,
    created_by,
    id,
    label,
    service_type,
    status,
    type,
    updated,
    updated_by,
  } = alert;

  return (
    <TableRow data-qa-alert-cell={id} key={`alert-row-${id}`}>
      <TableCell>
        <Link to={`${location.pathname}/detail/${service_type}/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell>
        <Box alignItems="center" display="flex">
          <StatusIcon
            data-testid="status-icon"
            status={alertStatusToIconStatusMap[status]}
          />
          {alertStatuses[status]}
        </Box>
      </TableCell>
      <TableCell>
        {services.find((service) => service.value === service_type)?.label}
      </TableCell>
      <TableCell data-testid={`created-${id}`}>
        {formatDate(created, {
          format: 'MMM dd, yyyy, h:mm a',
        })}
      </TableCell>
      <TableCell data-testid={`created-by-${id}`}>{created_by}</TableCell>
      <TableCell data-testid={`updated-${id}`}>
        {formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
        })}
      </TableCell>
      <TableCell data-testid={`updated-by-${id}`}>{updated_by}</TableCell>
      <TableCell actionCell data-qa-alert-action-cell={`alert_${id}`}>
        <AlertActionMenu
          alertLabel={label}
          alertStatus={status}
          alertType={type}
          handlers={handlers}
        />
      </TableCell>
    </TableRow>
  );
};
