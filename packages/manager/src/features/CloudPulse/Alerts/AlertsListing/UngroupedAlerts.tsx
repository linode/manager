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
  handleEnableDisable: (alert: Alert) => void;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
}

export const UngroupedAlerts = ({
  alerts,
  handleDetails,
  handleEdit,
  handleEnableDisable,
  services,
}: UngroupedAlertsProps) => {
  return (
    <React.Fragment>
      {alerts.map((alert: Alert) => (
        <AlertTableRow
          handlers={{
            handleDetails: () => handleDetails(alert),
            handleEdit: () => handleEdit(alert),
            handleEnableDisable: () => handleEnableDisable(alert),
          }}
          alert={alert}
          key={alert.id}
          services={services}
        />
      ))}
    </React.Fragment>
  );
};
