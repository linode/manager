import Axios from 'axios';

import { LINODE_STATUS_PAGE_URL } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

import type { IncidentResponse, MaintenanceResponse } from './types';
import type { AxiosError } from 'axios';

/**
 * Documentation for the Linode-specific status page API can be found at:
 * https://status.linode.com/api/v2/
 */

/**
 * Helper function to handle errors.
 */
const handleError = (error: AxiosError, defaultMessage: string) => {
  // Don't show any errors sent from the status page API to users, but report them to Sentry
  reportException(error);
  return Promise.reject([{ reason: defaultMessage }]);
};

/**
 * Return a list of incidents with a status of "unresolved."
 */
export const getIncidents = async () => {
  try {
    const response = await Axios.get<IncidentResponse>(
      `${LINODE_STATUS_PAGE_URL}/incidents/unresolved.json`
    );
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError, 'Error retrieving incidents.');
  }
};

/**
 * There are several endpoints for maintenance events; this method will return
 * a list of the most recent 50 maintenance, inclusive of all statuses.
 */
export const getAllMaintenance = async () => {
  try {
    const response = await Axios.get<MaintenanceResponse>(
      `${LINODE_STATUS_PAGE_URL}/scheduled-maintenances.json`
    );
    return response.data;
  } catch (error) {
    return handleError(
      error as AxiosError,
      'Error retrieving maintenance events.'
    );
  }
};
