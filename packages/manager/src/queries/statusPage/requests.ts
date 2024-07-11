import { LINODE_STATUS_PAGE_URL } from 'src/constants';

import type { IncidentResponse, MaintenanceResponse } from './types';
import type { APIError } from '@linode/api-v4';

/**
 * Documentation for the Linode-specific status page API can be found at:
 * https://status.linode.com/api/v2/
 */

/**
 * Helper function to handle errors.
 */
const handleError = (error: APIError, defaultMessage: string) => {
  return Promise.reject([{ reason: defaultMessage }]);
};

/**
 * Return a list of incidents with a status of "unresolved."
 */
export const getIncidents = async (): Promise<IncidentResponse> => {
  try {
    const response = await fetch(
      `${LINODE_STATUS_PAGE_URL}/incidents/unresolved.json`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json() as Promise<IncidentResponse>;
  } catch (error) {
    return handleError(error as APIError, 'Error retrieving incidents.');
  }
};

/**
 * There are several endpoints for maintenance events; this method will return
 * a list of the most recent 50 maintenance, inclusive of all statuses.
 */
export const getAllMaintenance = async (): Promise<MaintenanceResponse> => {
  try {
    const response = await fetch(
      `${LINODE_STATUS_PAGE_URL}/scheduled-maintenances.json`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json() as Promise<MaintenanceResponse>;
  } catch (error) {
    return handleError(
      error as APIError,
      'Error retrieving maintenance events.'
    );
  }
};
