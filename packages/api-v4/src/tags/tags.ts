import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage as Page, ResourcePage } from '../types';
import { Tag, TaggedObject, TagRequest } from './types';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { Tag, TagRequest } from './types';

export const getTags = (params?: Params, filter?: Filter) =>
  Request<Page<Tag>>(
    setURL(`${API_ROOT}/tags`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const createTag = (data: TagRequest) =>
  Request<Tag>(setURL(`${API_ROOT}/tags`), setMethod('POST'), setData(data));

export const deleteTag = (label: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/tags/${encodeURIComponent(label)}`),
    setMethod('DELETE'),
  );

export const getTaggedObjects = (label: string, params?: Params) =>
  Request<ResourcePage<TaggedObject>>(
    setURL(`${API_ROOT}/tags/${encodeURIComponent(label)}`),
    setParams(params),
    setMethod('GET')
  );
