import { array, boolean, object, string } from 'yup'

import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from './index';

type Page<T> = Linode.ResourcePage<T>;
type StackScript = Linode.StackScript.Response;

export const getStackScript = (id: number) =>
  Request<StackScript>(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getStackscripts = (params?: any, filter?: any) =>
  Request<Page<StackScript>>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )
    .then(response => response.data);

export const getStackScriptsByUser = (username: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    username,
    ...filter,
  });

export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    '+and': [
      { username: { '+neq': 'linode' } },
      { username: { '+neq': currentUser } },
    ],
    ...filter
  });

export const deleteStackScript = (id: number) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);
interface StackScriptPayload {
  script: string;
  label: string;
  images: string[];
  description?: string;
  is_public?: boolean;
  rev_note?: string;
}

const stackScriptSchema = object({
  script: string().required('Script is required.'),
  label: string().required('Label is required.'),
  images: array().of(string()).required('Images is required.'),
  description: string(),
  is_public: boolean(),
  rev_note: string(),
});

export const createStackScript = (payload: StackScriptPayload) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('POST'),
    setData(payload, stackScriptSchema)
  )
  .then(response => response.data);

export const updateStackScript = (id: number, payload: StackScriptPayload) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('PUT'),
    setData(payload, stackScriptSchema)
  )
  .then(response => response.data);

export const makeStackScriptPublic = (id: number) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('PUT'),
    setData({
      is_public: true,
    })
  )
