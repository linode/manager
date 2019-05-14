import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

type Page<T> = Linode.ResourcePage<T>;
type Type = Linode.LinodeType;

/**
 * getLinodeStats
 *
 * Returns CPU, IO, IPv4, and IPv6 statistics for your Linode for the past 24 hours.
 *
 * @param linodeId { number } The id of the Linode to retrieve stats data for.
 */
export const getLinodeStats = (linodeId: number) =>
  Request<Linode.Stats>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/stats`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * getLinodeStats
 *
 * Returns CPU, IO, IPv4, and IPv6 statistics for a specific month.
 * The year/month values must be either a date in the past, or the current month.
 * If the current month, statistics will be retrieved for the past 30 days.
 *
 * @param linodeId { number } The id of the Linode to retrieve stats data for.
 * @param year { number }
 * @param month { number }
 */
export const getLinodeStatsByDate = (
  linodeId: number,
  year: string,
  month: string
) =>
  Request<Linode.Stats>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/stats/${year}/${month}`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * getLinodeTransfer
 *
 * Returns current network transfer information for your Linode.
 *
 * @param linodeId { number } The id of the Linode to retrieve network transfer information for.
 */
export const getLinodeTransfer = (linodeId: number) =>
  Request<Linode.NetworkUtilization>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/transferpool`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * getLinodeKernels
 *
 * Returns a paginated list of available kernels.
 * This endpoint does not require authentication.
 *
 */
export const getLinodeKernels = (params?: any, filter?: any) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);

/**
 * getLinodeKernel
 *
 * Returns detailed information about a single Kernel.
 * This endpoint does not require authentication.
 *
 * @param kernelId { number } The id of the kernel to retrieve.
 */

export const getLinodeKernel = (kernelId: string) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels/${kernelId}`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * getLinodeTypes
 *
 * Return a paginated list of available Linode types.
 * This endpoint does not require authentication.
 *
 * @param linodeId { number } The id of the Linode to retrieve.
 */
export const getLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * getType
 *
 * View details for a single Linode type.
 * This endpoint does not require authentication.
 *
 * @param typeId { number } The id of the Linode type to retrieve.
 */
export const getType = (typeId: string) =>
  Request<Type>(
    setURL(`${API_ROOT}/linode/types/${typeId}`),
    setMethod('GET')
  ).then(response => response.data);

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
    setMethod('GET')
  ).then(response => response.data);
