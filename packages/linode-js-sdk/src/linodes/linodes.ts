import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types'
import { Volume } from '../volumes/types';
import { CreateLinodeSchema, UpdateLinodeSchema } from './linodes.schema';
import { CreateLinodeRequest, Linode } from './types';

/**
 * getLinode
 *
 * View details for a single Linode.
 *
 * @param linodeId { number } The id of the Linode to retrieve.
 */
export const getLinode = (linodeId: number) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('GET')
  );

/**
 * getLinodeLishToken
 *
 * Generates a token which can be used to authenticate with LISH.
 *
 * @param linodeId { number } The id of the Linode.
 */
export const getLinodeLishToken = (linodeId: number) =>
  Request<{ lish_token: string }>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/lish_token`),
    setMethod('POST')
  );

/**
 * getLinodeVolumes
 *
 * Returns a paginated list of Block Storage volumes attached to the
 * specified Linode.
 *
 * @param linodeId { number } The id of the Linode.
 */
export const getLinodeVolumes = (
  linodeId: number,
  params: any = {},
  filter: any = {}
) =>
  Request<Page<Volume>>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/volumes`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params)
  ).then(response => response.data);

/**
 * getLinodes
 *
 * Returns a paginated list of Linodes on your account.
 *
 * @param linodeId { number } The id of the Linode.
 */
export const getLinodes = (params?: any, filter?: any) =>
  Request<Page<Linode>>(
    setURL(`${API_ROOT}/linode/instances/`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params)
  ).then(response => response.data);

/**
 * createLinode
 *
 * Create a new Linode. The authenticating user must have the
 * add_linodes grant in order to use this endpoint.
 *
 * @param data { object } Options for type, region, etc.
 *
 * @returns the newly created Linode object.
 */
export const createLinode = (data: CreateLinodeRequest) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances`),
    setMethod('POST'),
    setData(data, CreateLinodeSchema)
  ).then(response => response.data);

/**
 * updateLinode
 *
 * Generates a token which can be used to authenticate with LISH.
 *
 * @param linodeId { number } The id of the Linode to be updated.
 * @param values { object } the fields of the Linode object to be updated.
 * Fields not included in this parameter will be left unchanged.
 */
export const updateLinode = (linodeId: number, values: Partial<Linode>) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('PUT'),
    setData(values, UpdateLinodeSchema)
  ).then(response => response.data);

/**
 * deleteLinode
 *
 * Delete the specified Linode instance.
 *
 * @param linodeId { number } The id of the Linode to be deleted.
 */
export const deleteLinode = (linodeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('DELETE')
  );
