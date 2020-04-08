import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@CLOUDMANAGER/Authentication');

interface TokensWithExpiry {
  token: string;
  scopes: string;
  expires: string;
}

/** user is coming to the app for the first time */
export const handleStartSession = actionCreator<TokensWithExpiry>(
  'START_SESSION'
);

/** user is refreshing the page and redux state needs to be synced with local storage */
export const handleInitTokens = actionCreator('INIT_TOKENS');

/** set redux state to what's in local storage */
export const handleRefreshTokens = actionCreator('REFRESH_TOKENS');

/**
 * These do the same thing - one is an alias of the other
 * basically just clear local storage and redux state
 */
export const handleLogout = actionCreator('LOGOUT');
