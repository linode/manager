import {
  capitalize,
  getQueryParamsFromQueryString,
  tryCatch,
} from '@linode/utilities';

import { generateCodeChallenge, generateCodeVerifier } from './pkce';
import {
  LoginAsCustomerCallbackParamsSchema,
  OAuthCallbackParamsSchema,
} from './schemas';
import { AuthenticationError } from './types';

import type {
  AuthCallbackOptions,
  TokenInfoToStore,
  TokenResponse,
} from './types';

interface Options {
  /**
   * @default https://login.linode.com
   */
  loginUrl?: string;
  clientId: string;
  /**
   * @default http://localhost:3000/oauth/callback
   */
  callbackUrl?: string;
  onError?: (error: AuthenticationError) => void;
}

export class OAuthClient {
  public LOGIN_URL = 'https://login.linode.com';
  public CLIENT_ID: string;
  public CALLBACK_URL = 'http://localhost:3000/oauth/callback';
  public onError?: (error: AuthenticationError) => void;

  constructor(options: Options) {
    if (options.loginUrl) {
      this.LOGIN_URL = options.loginUrl;
    }
    if (options.callbackUrl) {
      this.CALLBACK_URL = options.callbackUrl;
    }
    this.CLIENT_ID = options.clientId;
    this.onError = options.onError;
  }

  public setAuthDataInLocalStorage({
    scopes,
    token,
    expires,
  }: TokenInfoToStore) {
    localStorage.setItem('authentication/scopes', scopes);
    localStorage.setItem('authentication/token', token);
    localStorage.setItem('authentication/expire', expires);
  }

  public clearAuthDataFromLocalStorage() {
    localStorage.removeItem('authentication/scopes');
    localStorage.removeItem('authentication/token');
    localStorage.removeItem('authentication/expire');
  }

  private clearNonceAndCodeVerifierFromLocalStorage() {
    localStorage.removeItem('authentication/nonce');
    localStorage.removeItem('authentication/code-verifier');
  }

  private clearAllAuthDataFromLocalStorage() {
    this.clearNonceAndCodeVerifierFromLocalStorage();
    this.clearAuthDataFromLocalStorage();
  }

  public clearStorageAndRedirectToLogout() {
    this.clearAllAuthDataFromLocalStorage();
    window.location.assign(this.LOGIN_URL + '/logout');
  }

  public getIsAdminToken(token: string) {
    return token.toLowerCase().startsWith('admin');
  }

  public getIsLoggedInAsCustomer() {
    const token = localStorage.getItem('authentication/token');

    if (!token) {
      return false;
    }

    return this.getIsAdminToken(token);
  }

  private async generateCodeVerifierAndChallenge() {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('authentication/code-verifier', codeVerifier);
    return { codeVerifier, codeChallenge };
  }

  private generateNonce() {
    const nonce = window.crypto.randomUUID();
    localStorage.setItem('authentication/nonce', nonce);
    return { nonce };
  }

  private getPKCETokenRequestFormData(
    code: string,
    nonce: string,
    codeVerifier: string
  ) {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', this.CLIENT_ID);
    formData.append('code', code);
    formData.append('state', nonce);
    formData.append('code_verifier', codeVerifier);
    return formData;
  }

  /**
  * Attempts to revoke the user's current token, then redirects the user to the
  * "logout" page of the Login server (https://login.linode.com/logout).
  */
  public async logout() {
    const token = localStorage.getItem('authentication/token');

    this.clearAuthDataFromLocalStorage();

    if (token) {
      const tokenWithoutPrefix = token.split(' ')[1];

      try {
        const response = await fetch(`${this.LOGIN_URL}/oauth/revoke`, {
          body: new URLSearchParams({
            client_id: this.CLIENT_ID,
            token: tokenWithoutPrefix,
          }).toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          method: 'POST',
        });

        if (!response.ok) {
          const error = new AuthenticationError(
            'Request to POST /oauth/revoke was not ok.'
          );
          this.onError?.(error);
        }
      } catch (fetchError) {
        const error = new AuthenticationError(
          `Unable to revoke OAuth token because POST /oauth/revoke failed.`,
          fetchError
        );
        this.onError?.(error);
      }
    }

    window.location.assign(`${this.LOGIN_URL}/logout`);
  }

  /**
  * Generates an authorization URL for purposes of authorizating with the Login server
  *
  * @param returnTo the path in Cloud Manager to return to
  * @returns a URL that we will redirect the user to in order to authenticate
  * @example "https://login.fake.linode.com/oauth/authorize?client_id=9l424eefake9h4fead4d09&code_challenge=GDke2FgbFIlc1LICA5jXbUuvY1dThEDDtOI8roA17Io&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fcloud.fake.linode.com%2Foauth%2Fcallback%3FreturnTo%3D%2Flinodes&response_type=code&scope=*&state=99b64f1f-0174-4c7b-a3ab-d6807de5f524"
  */
  public async generateOAuthAuthorizeEndpoint(returnTo: string) {
    // Generate and store the nonce and code challenge for verification later
    const { nonce } = this.generateNonce();
    const { codeChallenge } = await this.generateCodeVerifierAndChallenge();

    const query = new URLSearchParams({
      client_id: this.CLIENT_ID,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: `${this.CALLBACK_URL}?returnTo=${returnTo}`,
      response_type: 'code',
      scope: '*',
      state: nonce,
    });

    return `${this.LOGIN_URL}/oauth/authorize?${query.toString()}`;
  }

  /**
  * Generates prerequisite data needed for authentication then redirects the user to the login server to authenticate.
  */
  public async login() {
    // Retain the user's current path and search params so that login redirects
    // the user back to where they left off.
    const returnTo = `${window.location.pathname}${window.location.search}`;

    const authorizeUrl = await this.generateOAuthAuthorizeEndpoint(returnTo);

    window.location.assign(authorizeUrl);
  }

  /**
  * Handles an OAuth callback to a URL like:
  * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
  *
  * @throws {AuthenticationError} if anything went wrong when starting session
  * @returns Some information about the new session because authentication was successfull
  */
  public async handleOAuthCallback(options: AuthCallbackOptions) {
    const { data: params, error: parseParamsError } = await tryCatch(
      OAuthCallbackParamsSchema.validate(
        getQueryParamsFromQueryString(options.params)
      )
    );

    if (parseParamsError) {
      throw new AuthenticationError(
        'Error parsing search params on OAuth callback.',
        parseParamsError
      );
    }

    const codeVerifier = localStorage.getItem('authentication/code-verifier');

    if (!codeVerifier) {
      throw new AuthenticationError(
        'No code codeVerifier found in local storage when running OAuth callback.'
      );
    }

    localStorage.removeItem('authentication/code-verifier')

    const storedNonce = localStorage.getItem('authentication/nonce');

    if (!storedNonce) {
      throw new AuthenticationError(
        'No nonce found in local storage when running OAuth callback.'
      );
    }

    localStorage.removeItem('authentication/nonce');

    /**
    * We need to validate that the nonce returned (comes from the location query param as the state param)
    * matches the one we stored when authentication was started. This confirms the initiator
    * and receiver are the same.
    */
    if (storedNonce !== params.state) {
      throw new AuthenticationError(
        'Stored nonce is not the same nonce as the one sent by login.'
      );
    }

    const formData = this.getPKCETokenRequestFormData(
      params.code,
      params.state,
      codeVerifier
    );

    const tokenCreatedAtDate = new Date();

    const { data: response, error: tokenError } = await tryCatch(
      fetch(`${this.LOGIN_URL}/oauth/token`, {
        body: formData,
        method: 'POST',
      })
    );

    if (tokenError) {
      throw new AuthenticationError(
        'Request to POST /oauth/token failed.',
        tokenError
      );
    }

    if (!response.ok) {
      throw new AuthenticationError('Request to POST /oauth/token was not ok.');
    }

    const { data: tokenParams, error: parseJSONError } =
      await tryCatch<TokenResponse>(response.json());

    if (parseJSONError) {
      throw new AuthenticationError(
        'Unable to parse the response of POST /oauth/token as JSON.',
        parseJSONError
      );
    }

    // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
    const tokenExpiresAt =
      tokenCreatedAtDate.getTime() + tokenParams.expires_in * 1000;

    this.setAuthDataInLocalStorage({
      token: `${capitalize(tokenParams.token_type)} ${tokenParams.access_token}`,
      scopes: tokenParams.scopes,
      expires: String(tokenExpiresAt),
    });

    return {
      returnTo: params.returnTo,
      expiresIn: tokenParams.expires_in,
    };
  }

  /**
  * Handles a "Login as Customer" callback to a URL like:
  * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&expires_in=900&token_type=Admin
  *
  * @throws {AuthenticationError} if anything went wrong when starting session
  * @returns Some information about the new session because authentication was successfull
  */
  public async handleLoginAsCustomerCallback(
    options: AuthCallbackOptions
  ) {
    const { data: params, error } = await tryCatch(
      LoginAsCustomerCallbackParamsSchema.validate(
        getQueryParamsFromQueryString(options.params)
      )
    );

    if (error) {
      throw new AuthenticationError(
        'Unable to login as customer. Admin did not send expected params in location hash.'
      );
    }

    // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
    const tokenExpiresAt = Date.now() + params.expires_in * 1000;

    /**
    * We have all the information we need and can persist it to localStorage
    */
    this.setAuthDataInLocalStorage({
      token: `${capitalize(params.token_type)} ${params.access_token}`,
      scopes: '*',
      expires: String(tokenExpiresAt),
    });

    return {
      returnTo: `/${params.destination}`, // The destination from admin does not include a leading slash
      expiresIn: params.expires_in,
    };
  }
}
