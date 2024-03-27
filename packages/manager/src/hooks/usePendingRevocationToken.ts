import { Token } from '@linode/api-v4';
import React from 'react';

import { getPersonalAccessTokenForRevocation } from 'src/features/Account/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { usePersonalAccessTokensQuery } from 'src/queries/tokens';

/**
 * Custom hook to manage the ID of a personal access token pending revocation.
 *
 * This hook provides functionality to determine which personal access token
 * should be considered for revocation based on the current authentication state
 * and the list of personal access tokens associated with the account. It utilizes
 * the current bearer token to identify the corresponding personal access token
 * and sets its ID for potential revocation actions.
 *
 * @returns {object} An object containing:
 * - `getPendingRevocationToken`: A function to fetch and set the pending revocation token ID based on current conditions.
 * - `pendingRevocationTokenId`: The ID of the token currently marked for pending revocation, or `undefined` if none.
 */
export const usePendingRevocationToken = () => {
  const [pendingRevocationToken, setPendingRevocationToken] = React.useState<
    Token | undefined
  >(undefined);
  const currentTokenWithBearer = useCurrentToken() ?? '';
  const { data: personalAccessTokens } = usePersonalAccessTokensQuery();

  const getPendingRevocationToken = async () => {
    if (!personalAccessTokens?.data) {
      return;
    }

    const token = await getPersonalAccessTokenForRevocation(
      personalAccessTokens?.data,
      currentTokenWithBearer
    );

    setPendingRevocationToken(token);
  };

  return {
    getPendingRevocationToken,
    pendingRevocationToken,
  };
};
