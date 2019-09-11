import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';
import { Tag, TagRequest } from './types';

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
