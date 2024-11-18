import { createAlertDefinition } from '@linode/api-v4/lib/cloudpulse';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type {
  Alert,
  CreateAlertDefinitionPayload,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError } from '@linode/api-v4/lib/types';

export const useCreateAlertDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>({
    mutationFn: (data) => createAlertDefinition(data),
    onSuccess() {
      queryClient.invalidateQueries(queryFactory.alerts);
    },
  });
};
