import Axios from 'axios';
import { APIError } from '@linode/api-v4/lib/types';
import { IncidentResponse, MaintenanceResponse } from './types';
import { useQuery } from 'react-query';
import { LINODE_STATUS_PAGE_ID } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { queryPresets } from '../base';

const BASE_URL = `https://${LINODE_STATUS_PAGE_ID}.statuspage.io/api/v2`;

/**
 * Documentation for the Linode-specific statuspage API can be found at:
 * https://8dn0wstr1chc.statuspage.io/api/v2/
 */

/**
 * Return a list of incidents with a status of "unresolved."
 */
const getIncidents = () => {
  return Axios.get<IncidentResponse>(`${BASE_URL}/incidents/unresolved.json`)
    .then((response) => response.data)
    .catch((error) => {
      // Don't show any errors sent from the statuspage API to users, but report them to Sentry
      reportException(error);
      return Promise.reject([{ reason: 'Error retrieving incidents.' }]);
    });
};

/**
 * There are several endpoints for maintenance events; this method will return
 * a list of currently active maintenance.
 */
const getScheduledMaintenance = () => {
  return Axios.get<MaintenanceResponse>(
    `${BASE_URL}/scheduled-maintenances/active.json`
  )
    .then((response) => response.data)
    .catch((error) => {
      // Don't show any errors sent from the statuspage API to users, but report them to Sentry
      reportException(error);
      return Promise.reject([
        { reason: 'Error retrieving maintenance events.' },
      ]);
    });
};

const incidentKey = 'status-page-incidents';
const maintenanceKey = 'status-page-maintenance';

export const useIncidentQuery = () => {
  return useQuery<IncidentResponse, APIError[]>(
    incidentKey,
    getIncidents,
    queryPresets.longLived
  );
};

export const useMaintenanceQuery = () => {
  return useQuery<MaintenanceResponse, APIError[]>(
    maintenanceKey,
    getScheduledMaintenance,
    queryPresets.longLived
  );
};
