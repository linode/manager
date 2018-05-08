import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod } from '.';

export const getPersonalAccessTokens = () => Request(
  setURL(`${API_ROOT}/profile/tokens`),
  setMethod('GET'),
);

export const getAppTokens = () => Request(
  setURL(`${API_ROOT}/profile/apps`),
  setMethod('GET'),
);

export const removePersonalAccessToken = (tokenId: number) => Request(
  setURL(`${API_ROOT}/profile/tokens/${tokenId}`),
  setMethod('DELETE'),
);

export const removeAppToken = (tokenId: number) => Request(
  setURL(`${API_ROOT}/profile/apps/${tokenId}`),
  setMethod('DELETE'),
);
