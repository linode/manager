import { useMutation } from 'react-query';
import { APIError } from '@linode/api-v4/lib/types';
import { resetKubeConfig } from '@linode/api-v4/lib';

export const useResetKubeConfigMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => resetKubeConfig(id));
