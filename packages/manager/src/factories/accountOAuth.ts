import { Factory } from '@linode/utilities';

import type { OAuthClient } from '@linode/api-v4';

export const oauthClientFactory = Factory.Sync.makeFactory<OAuthClient>({
  id: Factory.each((id) => String(id)),
  label: Factory.each((id) => `oauth-client-${id}`),
  public: false,
  redirect_uri: 'http://localhost:3000/api/auth/callback/linode',
  secret: '<REDACTED>',
  status: 'active',
  thumbnail_url: null,
});
