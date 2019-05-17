import { API_ROOT } from 'src/constants';

import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

type Page<T> = Linode.ResourcePage<T>;

export interface Tag {
  label: string;
}

export interface TagRequest {
  label: string;
  linodes?: number[];
}

export const getTags = (params?: any, filter?: any) =>
  Request<Page<Tag>>(
    setURL(`${API_ROOT}/tags`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);

export const createTag = (data: TagRequest) =>
  Request<Tag>(
    setURL(`${API_ROOT}/tags`),
    setMethod('POST'),
    setData(data)
  ).then(response => response.data);

export const deleteTag = (label: string) =>
  Request<Tag>(setURL(`${API_ROOT}/tags/${label}`), setMethod('DELETE')).then(
    response => response.data
  );
