import * as Bluebird from 'bluebird';
import { range } from 'ramda';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

import { resizeLinodeDiskSchema } from './linode.schema';

type Page<T> = Linode.ResourcePage<T>;
type Disk = Linode.Disk;

export interface LinodeDiskCreationData {
  label: string;
  size: number;
  filesystem?: string;
}

export const getLinodeDisks = (id: number, params?: any, filter?: any) =>
  Request<Page<Disk>>(
    setURL(`${API_ROOT}/linode/instances/${id}/disks`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  )
    .then(response => response.data);

export const getAllLinodeDisks: (linodeId: number) => Promise<Linode.Disk[]> =
  (linodeId, params = {}, filters = {}) => {
    const pagination = { ...params, page_size: 100 };

    return getLinodeDisks(linodeId, pagination, filters)
      .then(({ data: firstPageData, page, pages }) => {

        // If we only have one page, return it.
        if (page === pages) { return firstPageData; }

        // Create an iterable list of the remaining pages.
        const remainingPages = range(page + 1, pages + 1);

        //
        return Bluebird
          .map(remainingPages, nextPage =>
            getLinodeDisks(linodeId, { ...pagination, page: nextPage }, filters).then(response => response.data),
          )
          /** We're given Linode.Volume[][], so we flatten that, and append the first page response. */
          .then(allPages => allPages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
      });
  }

export const createLinodeDisk = (
  linodeId: number,
  data: LinodeDiskCreationData,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks`),
  setMethod('POST'),
  setData(data),
  );

export const getLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('GET'),
  );

export const updateLinodeDisk = (
  linodeId: number,
  diskId: number,
  data: Pick<LinodeDiskCreationData, 'label'>,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('PUT'),
  setData(data),
  );

  export const resizeLinodeDisk = (linodeId: number, diskId: number, size: number) =>
  Request<Linode.Disk>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/resize`),
    setMethod('POST'),
    setData({ size }, resizeLinodeDiskSchema),
  );

export const deleteLinodeDisk = (
  linodeId: number,
  diskId: number,
) => Request<{}>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}`),
  setMethod('DELETE'),
  );

export const changeLinodeDiskPassword = (
  linodeId: number,
  diskId: number,
  password: string,
) => Request<Disk>(
  setURL(`${API_ROOT}/linode/instances/${linodeId}/disks/${diskId}/password`),
  setMethod('POST'),
  setData({ password }),
)
  .then(response => response.data);