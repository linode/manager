import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { NotificationChannelAlerts } from '@linode/api-v4';
interface NotificationChannelAlertsTableRowProps {
  /**
   * Alert details to display in the row
   */
  alert: NotificationChannelAlerts;
  /**
   * Label of the service type associated with the alert
   */
  serviceTypeLabel?: string;
}

export const NotificationChannelAlertsTableRow = React.memo(
  (props: NotificationChannelAlertsTableRowProps) => {
    const { alert, serviceTypeLabel } = props;
    const { label, service_type, id } = alert;

    return (
      <TableRow
        data-qa-alert-cell={`table-row-${id}`}
        data-testid={`table-row-${id}`}
        key={`alert-row-${id}`}
      >
        <TableCell>
          <Link
            data-qa-alert-link
            to={`/alerts/definitions/detail/${service_type}/${id}`}
          >
            {label}
          </Link>
        </TableCell>
        <TableCell>{serviceTypeLabel}</TableCell>
      </TableRow>
    );
  }
);
