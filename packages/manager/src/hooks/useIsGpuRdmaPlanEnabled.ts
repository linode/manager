import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';
/**
 *
 * @returns an object that contains boolean property to check whether GPU RDMA plan is enabled or not
 */
export const useIsGpuRdmaPlanEnabled = () => {
  const flags = useFlags();

  const { data: account } = useAccount();

  const isGpuRdmaPlanEnabled = isFeatureEnabledV2(
    'GPUDirect RDMA',
    Boolean(flags.nitro?.enabled),
    account?.capabilities ?? []
  );

  return { isGpuRdmaPlanEnabled };
};
