import { createAlertDefinition } from '@linode/api-v4/lib/cloudpulse';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Alert,
  CreateAlertDefinitionPayload,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError } from '@linode/api-v4/lib/types';

export const aclpQueryKey = 'aclp-alerts';

export const useCreateAlertDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>({
    mutationFn: (data) => createAlertDefinition(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [aclpQueryKey] });
    },
  });
};
