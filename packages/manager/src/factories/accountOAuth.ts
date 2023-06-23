import { OAuthClient } from '@linode/api-v4';
import * as Factory from 'factory.ts';

export const oauthClientFactory = Factory.Sync.makeFactory<OAuthClient>({
  id: Factory.each((id) => String(id)),
  label: Factory.each((id) => `oauth-client-${id}`),
  public: false,
  redirect_uri: 'http://localhost:3000/api/auth/callback/linode',
  secret: Factory.each((id) => `1a2b3c4d5e6f0123456789abcdef${id}`),
  status: 'active',
  thumbnail_url: null,
});
