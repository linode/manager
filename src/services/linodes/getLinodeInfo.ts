import * as Bluebird from 'bluebird';
import { range } from 'ramda';

import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

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

export const getLinodeKernels = (params?: any, filter?: any) =>
  Request<Page<Linode.Kernel>>(
    setURL(`${API_ROOT}/linode/kernels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  )
    .then(response => response.data);

export const getAllKernels: (params?: any, filters?: any) => Promise<Linode.Kernel[]> =
  (linodeId, params = {}, filters = {}) => {
    const pagination = { ...params, page_size: 100 };

    return getLinodeKernels(params, filters)
      .then(({ data: firstPageData, page, pages }) => {

        // If we only have one page, return it.
        if (page === pages) { return firstPageData; }

        // Create an iterable list of the remaining pages.
        const remainingPages = range(page + 1, pages + 1);

        //
        return Bluebird
          .map(remainingPages, nextPage =>
            getLinodeKernels({ ...pagination, page: nextPage }, filters).then(response => response.data),
          )
          .then(allPages => allPages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
      });
  }

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