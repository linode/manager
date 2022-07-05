import { useMutation } from 'react-query';
import { APIError } from '@linode/api-v4';
import { resetKubeConfig } from '@linode/api-v4';

export const useResetKubeConfigMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => resetKubeConfig(id));
