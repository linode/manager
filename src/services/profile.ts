import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '.';

type Page<T> = Linode.ResourcePage<T>;
type Token = Linode.Token;
type Secret = Linode.Secret;

export const getProfile = () => Request<Linode.Profile>(
  setURL(`${API_ROOT}/profile`),
  setMethod('GET'),
);

export const updateProfile = (data: any) => Request<Linode.Profile>(
  setURL(`${API_ROOT}/profile`),
  setMethod('PUT'),
  /** @todo */
  // validateRequestData(data, ProfileUpdateSchema)
  setData(data),
)
  .then(response => response.data);

/** Two-factor authentication */
export const getTFAToken = () =>
  Request<Secret>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/tfa-enable`)
  )

export const disableTwoFactor = () =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/tfa-disable`)
  )

export const confirmTwoFactor = (code:string) =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/tfa-enable-confirm`),
    setData({ tfa_code: code })
  )

/** App Tokens */
export const createAppToken = (data: any) =>
  Request<Token>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/apps`),
    setData(data),
  )
    .then(response => response.data);

export const getAppToken = (id: number) =>
  Request<Token>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/apps/${id}`),
  )
    .then(response => response.data);

export const updateAppToken = (id: number, data: any) =>
  Request<Token>(
    setURL(`${API_ROOT}/profile/apps/${id}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deleteAppToken = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/apps/${id}`),
    setMethod('DELETE'),
  );

export const getAppTokens = () =>
  Request<Page<Token>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/apps`),
  )
    .then(response => response.data);

/** Personal Access Tokens */
export const createPersonalAccessToken = (data: any) =>
  Request<Token>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/tokens`),
    setData(data),
  )
    .then(response => response.data);

export const getPersonalAccessToken = (id: number) =>
  Request<Token>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/tokens/${id}`),
  )
    .then(response => response.data);

export const updatePersonalAccessToken = (id: number, data: any) =>
  Request<Token>(
    setURL(`${API_ROOT}/profile/tokens/${id}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deletePersonalAccessToken = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/tokens/${id}`),
    setMethod('DELETE'),
  );

export const getPersonalAccessTokens = () =>
  Request<Page<Token>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/tokens`),
  )
    .then(response => response.data);
