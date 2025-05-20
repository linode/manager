import { TableBody } from '@mui/material';
import * as React from 'react';

import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { AlertServiceType } from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';

interface UngroupedAlertsProps {
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
  /**
   * Callback function to handle deleting an alert
   */
  handleDelete: (alert: Alert) => void;
  /**
   * Callback function to handle viewing alert details
   */
  handleDetails: (alert: Alert) => void;
  /**
   * Callback function to handle editing an alert
   */
  handleEdit: (alert: Alert) => void;
  /**
   * Callback function to handle enabling or disabling an alert
   */
  handleStatusChange: (alert: Alert) => void;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
}

export const AlertsTable = ({
  alerts,
  handleDelete,
  handleDetails,
  handleEdit,
  handleStatusChange,
  services,
}: UngroupedAlertsProps) => {
  return (
    <TableBody>
      {alerts.map((alert: Alert) => (
        <AlertTableRow
          alert={alert}
          handlers={{
            handleDelete: () => handleDelete(alert),
            handleDetails: () => handleDetails(alert),
            handleEdit: () => handleEdit(alert),
            handleStatusChange: () => handleStatusChange(alert),
          }}
          key={alert.id}
          services={services}
        />
      ))}
    </TableBody>
  );
};
