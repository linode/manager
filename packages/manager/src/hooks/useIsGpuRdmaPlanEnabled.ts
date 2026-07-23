import { useAccount } from '@linode/queries';
import { isFeatureEnabled } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';
/**
 *
 * @returns an object that contains boolean property to check whether GPU RDMA plan is enabled or not
 */
export const useIsGpuRdmaPlanEnabled = () => {
  const flags = useFlags();

  const { data: account } = useAccount();

  // TODO: Switch to isFeatureEnabledV2 (AND logic) once the 'GPUDirect RDMA' capability
  // is available in the API. Currently using OR logic for development.
  const isGpuRdmaPlanEnabled = isFeatureEnabled(
    'GPUDirect RDMA',
    Boolean(flags.nitro?.enabled),
    account?.capabilities ?? []
  );

  return { isGpuRdmaPlanEnabled };
};
