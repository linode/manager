import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type {
  NetworkTransfer,
  RegionalNetworkUtilization,
} from '../account/types';
import type { Filter, ResourcePage as Page, Params } from '../types';
import type { Kernel, Stats, LinodeType as Type } from './types';

/**
 * getLinodeStats
 *
 * Returns CPU, IO, IPv4, and IPv6 statistics for your Linode for the past 24 hours.
 *
 * @param linodeId { number } The id of the Linode to retrieve stats data for.
 */
export const getLinodeStats = (linodeId: number) =>
  Request<Stats>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/stats`,
    ),
    setMethod('GET'),
  );

/**
 * getLinodeStats
 *
 * Returns CPU, IO, IPv4, and IPv6 statistics for a specific month.
 * The year/month values must be either a date in the past, or the current month.
 * If the current month, statistics will be retrieved for the past 30 days.
 *
 * @param linodeId { number } The id of the Linode to retrieve stats data for.
 * @param year { string }
 * @param month { string }
 */
export const getLinodeStatsByDate = (
  linodeId: number,
  year: string,
  month: string,
) =>
  Request<Stats>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/stats/${encodeURIComponent(year)}/${encodeURIComponent(month)}`,
    ),
    setMethod('GET'),
  );

/**
 * getLinodeTransfer
 *
 * Returns current network transfer information for your Linode.
 *
 * @param linodeId { number } The id of the Linode to retrieve network transfer information for.
 */
export const getLinodeTransfer = (linodeId: number) =>
  Request<RegionalNetworkUtilization>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/transfer`,
    ),
    setMethod('GET'),
  );

/**
 * getLinodeTransferByDate
 *
 * Returns network transfer information for your Linode by date
 *
 * @param linodeId { number } The id of the Linode to retrieve network transfer information for.
 * @param year { string }
 * @param month { string }
 */
export const getLinodeTransferByDate = (
  linodeId: number,
  year: string,
  month: string,
) =>
  Request<NetworkTransfer>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/transfer/${encodeURIComponent(year)}/${encodeURIComponent(month)}`,
    ),
    setMethod('GET'),
  );

/**
 * getLinodeKernels
 *
 * Returns a paginated list of available kernels.
 * This endpoint does not require authentication.
 *
 */
export const getLinodeKernels = (params?: Params, filter?: Filter) =>
  Request<Page<Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getLinodeKernel
 *
 * Returns detailed information about a single Kernel.
 * This endpoint does not require authentication.
 *
 * @param kernelId { string } The id of the kernel to retrieve.
 */

export const getLinodeKernel = (kernelId: string) =>
  Request<Kernel>(
    setURL(`${API_ROOT}/linode/kernels/${encodeURIComponent(kernelId)}`),
    setMethod('GET'),
  );

/**
 * getLinodeTypes
 *
 * Return a paginated list of available Linode types.
 * This endpoint does not require authentication.
 */
export const getLinodeTypes = (params?: Params) =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * getType
 *
 * View details for a single Linode type.
 * This endpoint does not require authentication.
 *
 * @param typeId { string } The id of the Linode type to retrieve.
 */
export const getType = (typeId: string) =>
  Request<Type>(
    setURL(`${API_ROOT}/linode/types/${encodeURIComponent(typeId)}`),
    setMethod('GET'),
  );

/**
 * getDeprecatedLinodeTypes
 *
 * Returns a list of deprecated Types that are no longer
 * supported. This endpoint does not require authentication.
 *
 */
export const getDeprecatedLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types-legacy`),
    setMethod('GET'),
  );
