import { number, object, string } from 'yup';

/**
 * Used to validate query params for the OAuth callback
 *
 * The URL would look like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 */
export const OAuthCallbackParamsSchema = object({
  returnTo: string().default('/'),
  code: string().required(),
  state: string().required(), // aka "nonce"
});

/**
 * Used to validate hash params for the "Login as Customer" callback
 *
 * The URL would look like:
 * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&expires_in=900&token_type=Admin
 */
export const LoginAsCustomerCallbackParamsSchema = object({
  access_token: string().required(),
  destination: string().default('/'),
  expires_in: number().required(),
  token_type: string().required().oneOf(['Admin']),
});
