import { createPartnerReferral } from '@linode/api-v4';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { accountQueries } from '../account';

import type {
  APIError,
  MarketplacePartnerReferralPayload,
} from '@linode/api-v4';

export const useCreatePartnerReferralMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], MarketplacePartnerReferralPayload>({
    mutationFn: createPartnerReferral,
    onSuccess: () => {
      setTimeout(() => {
        // Refetch notifications after 1.5 seconds. The API needs some time to process.
        queryClient.invalidateQueries({
          queryKey: accountQueries.notifications.queryKey,
        });
      }, 1500);
    },
  });
};
