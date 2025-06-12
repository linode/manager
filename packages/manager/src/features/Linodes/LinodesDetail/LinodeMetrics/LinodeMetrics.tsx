import { Box } from '@linode/ui';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import LinodeSummary from './LinodeSummary/LinodeSummary';

interface Props {
  isAclpBetaLocal: boolean;
  isAclpSupportedRegionLinode: boolean;
  linodeCreated: string;
  linodeId: number;
  setIsAclpBetaLocal: React.Dispatch<React.SetStateAction<boolean>>;
}

const LinodeMetrics = (props: Props) => {
  const {
    linodeCreated,
    linodeId,
    isAclpSupportedRegionLinode,
    isAclpBetaLocal,
    setIsAclpBetaLocal,
  } = props;

  const flags = useFlags();
  const linodeDashboardId = 2;

  return (
    <Box>
      {flags.aclpBetaServices?.metrics && isAclpSupportedRegionLinode && (
        <AclpPreferenceToggle
          isAclpBetaLocal={isAclpBetaLocal}
          setIsAclpBetaLocal={setIsAclpBetaLocal}
          type="metrics"
        />
      )}

      {flags.aclpBetaServices?.metrics &&
      isAclpSupportedRegionLinode &&
      isAclpBetaLocal ? (
        // Beta ACLP Metrics View
        <CloudPulseDashboardWithFilters
          dashboardId={linodeDashboardId}
          resource={linodeId}
        />
      ) : (
        // Legacy Metrics View
        <LinodeSummary linodeCreated={linodeCreated} />
      )}
    </Box>
  );
};

export default LinodeMetrics;
