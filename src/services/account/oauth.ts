import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

type OAuthClient = Linode.OAuthClient;
type Page<T> = Linode.ResourcePage<T>;

export const getOAuthClients = (params?: any, filter?: any) =>
  Request<Page<OAuthClient>>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  )
    .then(response => response.data);

export const getOAuthClient = (clientId: number) =>
  Request<string>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const createOAuthClient = (data: any) =>
  Request<OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const resetOAuthClientSecret = (clientId: number | string) =>
  Request<Linode.OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}/reset-secret`),
    setMethod('POST'),
  )
    .then(response => response.data);

export const updateOAuthClient = (clientId: number, data: any) =>
  Request<OAuthClient>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deleteOAuthClient = (clientId: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('DELETE'),
  );