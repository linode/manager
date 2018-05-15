import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod } from '.';

type Page<T> = Linode.ResourcePage<T>;
type Token = Linode.Token;

export const getPersonalAccessTokens = () => Request<Page<Token>>(
  setURL(`${API_ROOT}/profile/tokens`),
  setMethod('GET'),
);

export const getAppTokens = () => Request<Page<Token>>(
  setURL(`${API_ROOT}/profile/apps`),
  setMethod('GET'),
);

export const removePersonalAccessToken = (tokenId: number) => Request<{}>(
  setURL(`${API_ROOT}/profile/tokens/${tokenId}`),
  setMethod('DELETE'),
);

export const removeAppToken = (tokenId: number) => Request<{}>(
  setURL(`${API_ROOT}/profile/apps/${tokenId}`),
  setMethod('DELETE'),
);
