import { useLinodeQuery, usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import LinodeSummary from './LinodeSummary/LinodeSummary';

const LinodeMetrics = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const { data: linode } = useLinodeQuery(linodeId);

  const isAclpMetricsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'metrics',
  });

  const { aclpServices } = useFlags();
  const { data: isAclpMetricsPreference } = usePreferences(
    (preferences) => preferences?.isAclpMetricsMode
  );
  const isAclpMetricsInRegionEnabled =
    aclpServices?.linode?.metrics?.enabled &&
    isAclpMetricsSupportedRegionLinode;
  const linodeDashboardId = 2;

  return (
    <Box>
      {isAclpMetricsInRegionEnabled && <AclpPreferenceToggle type="metrics" />}
      {isAclpMetricsInRegionEnabled && isAclpMetricsPreference ? (
        // ACLP Metrics View
        <CloudPulseDashboardWithFilters
          dashboardId={linodeDashboardId}
          resource={linodeId}
        />
      ) : (
        // Legacy Metrics View
        <LinodeSummary linodeCreated={linode?.created ?? ''} />
      )}
    </Box>
  );
};

export default LinodeMetrics;
