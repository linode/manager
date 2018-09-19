import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '..';

type Page<T> = Linode.ResourcePage<T>;
type Token = Linode.Token;

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