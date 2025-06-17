/**
 * Represents the response type of POST https://login.linode.com/oauth/token
 */
export interface TokenResponse {
  /**
   * An accces token that you use as the Bearer token when making API requests
   *
   * @example "59340e48bb1f64970c0e1c15a3833c6adf8cf97f478252eee8764b152704d447"
   */
  access_token: string;
  /**
   * The lifetime of the access_token (in seconds)
   *
   * @example 7200
   */
  expires_in: number;
  /**
   * Currently not supported I guess.
   */
  refresh_token: null;
  /**
   * The scope of the access_token.
   *
   * @example "*"
   */
  scopes: string;
  /**
   * The type of the access token
   * @example "bearer"
   */
  token_type: 'bearer';
}

export interface TokenInfoToStore {
  /**
   * The expiry timestamp for the the token
   *
   * This is a unix timestamp (milliseconds since the Unix epoch)
   *
   * @example "1750130180465"
   */
  expires: string;
  /**
   * The OAuth scopes
   *
   * @example "*"
   */
  scopes: string;
  /**
   * The token including the prefix
   *
   * @example "Bearer 12345" or "Admin 12345"
   */
  token: string;
}

interface OAuthCallbackOnSuccessData {
  /**
   * The number of seconds untill the token expires
   */
  expiresIn: number;
  /**
   * The path to redirect to
   */
  returnTo: string;
}

/**
 * Options that can be provided to our OAuth Callback handler functions
 */
export interface AuthCallbackOptions {
  /**
   * `onSuccess` is invoked when a Cloud Manager session has successfully started
   */
  onSuccess?: (data: OAuthCallbackOnSuccessData) => void;
  /**
   * The raw search or has params sent by the login server
   */
  params: string;
}
