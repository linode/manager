import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

import {
  CreateLinodeSchema,
} from './linode.schema';

type Page<T> = Linode.ResourcePage<T>;
type Linode = Linode.Linode;

export const getLinode = (id: number) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('GET'),
  );

export const getLinodeLishToken = (id: number) =>
  Request<{ lish_token: string }>(
    setURL(`${API_ROOT}/linode/instances/${id}/lish_token`),
    setMethod('POST'),
  );

export const getLinodeVolumes = (id: number) =>
  Request<Page<Linode.Volume>>(
    setURL(`${API_ROOT}/linode/instances/${id}/volumes`),
    setMethod('GET'),
  )
    .then(response => response.data);


export const getLinodes = (params: any = {}, filter: any = {}) =>
  Request<Page<Linode>>(
    setURL(`${API_ROOT}/linode/instances/`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  )
    .then(response => response.data);

export const getLinodesPage = (page: number) =>
  Request<Page<Linode>>(
    setURL(`${API_ROOT}/linode/instances/`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const createLinode = (data: any) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances`),
    setMethod('POST'),
    setData(data, CreateLinodeSchema),
  )
    .then(response => response.data);

export const updateLinode = (id: number, values: Partial<Linode>) =>
  Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('PUT'),
    setData(values),
  )
    .then(response => response.data);

export const deleteLinode = (linodeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}`),
    setMethod('DELETE'),
  );
