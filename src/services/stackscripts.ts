import * as Joi from 'joi';

import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
  validateRequestData,
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

// API does not currently support this
// export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
//   getStackscripts(params, {
//     '+and': [
//       { username: { '+not': 'linode' } },
//       { username: { '+not': currentUser } },
//       ...filter,
//     ],
//   });

export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
  getStackscripts(params, filter).then((response) => {
    const withoutOwnAndLinode = response.data.filter((stackScript) => {
      return stackScript.username !== 'linode' && stackScript.username !== currentUser;
    });
    return {
      ...response,
      data: withoutOwnAndLinode,
    };
  });

export const deleteStackScript = (id: number) =>
  Request(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);
interface CreatePayload {
  script: string;
  label: string;
  images: string[];
  description?: string;
  is_public?: boolean;
  rev_note?: string;
}

const createStackScriptSchema = Joi.object({
  script: Joi.string().required(),
  label: Joi.string().required(),
  images: Joi.array().items(Joi.string()).required(),
  description: Joi.string().allow(""),
  is_public: Joi.boolean(),
  rev_note: Joi.string().allow(""),
});

export const createStackScript = (payload: CreatePayload) =>
  Request(
    validateRequestData(payload, createStackScriptSchema),
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('POST'),
    setData(payload)
  )
