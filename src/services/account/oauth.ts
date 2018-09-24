import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/services';

type OAuthClient = Linode.OAuthClient;
type Page<T> = Linode.ResourcePage<T>;

export const getOAuthClient = (id: number) =>
  Request<string>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getOAuthClients = () =>
  Request<Page<OAuthClient>>(
    setURL(`${API_ROOT}/account/oauth-clients`),
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

export const resetOAuthClientSecret = (id: number | string) =>
  Request<Linode.OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}/reset-secret`),
    setMethod('POST'),
  )
    .then(response => response.data);

export const updateOAuthClient = (id: number, data: any) =>
  Request<OAuthClient>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deleteOAuthClient = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('DELETE'),
  );