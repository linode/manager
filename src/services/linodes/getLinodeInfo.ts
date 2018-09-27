import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL } from '../index';

type Page<T> = Linode.ResourcePage<T>;
type Type = Linode.LinodeType;

/** @todo type */
export const getLinodeStats = (linodeId: number, year?: string, month?: string) => {
  const endpoint = (year && month)
    ? `${API_ROOT}/linode/instances/${linodeId}/stats/${year}/${month}`
    : `${API_ROOT}/linode/instances/${linodeId}/stats`;
  return Request(
    setURL(endpoint),
    setMethod('GET'),
  );
};

export const getLinodeKernels = (page: number = 0) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getType = (typeId: string) =>
  Request<Type>(
    setURL(`${API_ROOT}/linode/types/${typeId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getDeprecatedLinodeTypes = () =>
  Request<Page<Type>>(
    setURL(`${API_ROOT}/linode/types-legacy`),
    setMethod('GET')
  )
    .then(response => response.data);