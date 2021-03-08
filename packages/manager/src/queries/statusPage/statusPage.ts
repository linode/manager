import Axios from 'axios';
import { APIError } from '@linode/api-v4/lib/types';
import { IncidentResponse, MaintenanceResponse } from './types';
import { useQuery } from 'react-query';
import { LINODE_STATUS_PAGE_ID } from 'src/constants';
import { queryPresets } from '../base';

const BASE_URL = `https://${LINODE_STATUS_PAGE_ID}.statuspage.io/api/v2`;

const getIncidents = () => {
  return Axios.get<IncidentResponse>(`${BASE_URL}/incidents/unresolved.json`)
    .then((response) => response.data)
    .catch((_) => Promise.reject([{ reason: 'Error retrieving incidents.' }]));
};

const getScheduledMaintenance = () => {
  return Axios.get<MaintenanceResponse>(
    `${BASE_URL}/scheduled-maintenances/active.json`
  )
    .then((response) => response.data)
    .catch((_) =>
      Promise.reject([{ reason: 'Error retrieving maintenance events.' }])
    );
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
