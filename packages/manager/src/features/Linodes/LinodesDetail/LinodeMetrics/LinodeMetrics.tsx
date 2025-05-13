import { usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { useFlags } from 'src/hooks/useFlags';

import { AclpMetricsPreferenceToggle } from './AclpMetricsPreferenceToggle';
import LinodeSummary from './LinodeSummary/LinodeSummary';

interface Props {
  linodeCreated: string;
  linodeId: number;
}

const LinodeMetrics = ({ linodeCreated, linodeId }: Props) => {
  const flags = useFlags();
  const { data: isAclpMetricsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );
  const linodeDashboardId = 2;

  return (
    <Box>
      {flags.aclpIntegration ? <AclpMetricsPreferenceToggle /> : null}
      {flags.aclpIntegration && isAclpMetricsPreferenceBeta ? (
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
