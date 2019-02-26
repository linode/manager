import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@CLOUDMANAGER/Authentication');

interface TokensWithExpiry {
  token?: string;
  scopes?: string;
  expires?: string;
}

export const handleLogout = actionCreator('LOGOUT');
export const handleInitTokens = actionCreator('INIT_TOKENS');
export const handleStartSession = actionCreator<TokensWithExpiry>(
  'START_SESSION'
);
export const handleRefreshTokens = actionCreator('REFRESH_TOKENS');
export const handleExpireTokens = actionCreator('EXPIRE_TOKENS');
