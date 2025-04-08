import * as React from 'react';

import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { Alert } from '@linode/api-v4';
import type { AlertServiceType } from '@linode/api-v4';

interface UngroupedAlertsProps {
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
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
  handleDetails,
  handleEdit,
  handleStatusChange,
  services,
}: UngroupedAlertsProps) => {
  return (
    <>
      {alerts.map((alert: Alert) => (
        <AlertTableRow
          handlers={{
            handleDetails: () => handleDetails(alert),
            handleEdit: () => handleEdit(alert),
            handleStatusChange: () => handleStatusChange(alert),
          }}
          alert={alert}
          key={alert.id}
          services={services}
        />
      ))}
    </>
  );
};
