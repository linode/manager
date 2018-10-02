import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../index';

import { stackScriptSchema, updateStackScriptSchema } from './stackscripts.schema';

type Page<T> = Linode.ResourcePage<T>;
type StackScript = Linode.StackScript.Response;

interface StackScriptPayload {
  script: string;
  label: string;
  images: string[];
  description?: string;
  is_public?: boolean;
  rev_note?: string;
}

export const getStackscripts = (params?: any, filter?: any) =>
  Request<Page<StackScript>>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )
    .then(response => response.data);

export const getStackScript = (id: number) =>
  Request<StackScript>(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const createStackScript = (payload: StackScriptPayload) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('POST'),
    setData(payload, stackScriptSchema)
  )
  .then(response => response.data);

export const updateStackScript = (id: number, payload: Partial<StackScriptPayload>) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('PUT'),
    setData(payload, updateStackScriptSchema)
  )
  .then(response => response.data);

  export const deleteStackScript = (id: number) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);
