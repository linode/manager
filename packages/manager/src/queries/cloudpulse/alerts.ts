import { createAlertDefinition } from '@linode/api-v4/lib/cloudpulse';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Alert,
  CreateAlertDefinitionPayload,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError } from '@linode/api-v4/lib/types';

export const queryKey = 'aclp-alerts';

export const useCreateAlertDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>(
    (data) => createAlertDefinition(data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
      },
    }
  );
};
