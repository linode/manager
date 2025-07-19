import {
  useLinodeQuery,
  usePreferences,
  useRegionsQuery,
} from '@linode/queries';
import { Box } from '@linode/ui';
import { isAclpSupportedRegion } from '@linode/utilities';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import LinodeSummary from './LinodeSummary/LinodeSummary';

const LinodeMetrics = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const { data: linode } = useLinodeQuery(linodeId);
  const { data: regions } = useRegionsQuery();

  const isAclpMetricsSupportedRegionLinode = isAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    regions,
    type: 'metrics',
  });

  const { aclpBetaServices } = useFlags();
  const { data: isAclpMetricsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );
  const linodeDashboardId = 2;

  return (
    <Box>
      {aclpBetaServices?.linode?.metrics &&
        isAclpMetricsSupportedRegionLinode && (
          <AclpPreferenceToggle type="metrics" />
        )}
      {aclpBetaServices?.linode?.metrics &&
      isAclpMetricsSupportedRegionLinode &&
      isAclpMetricsPreferenceBeta ? (
        // Beta ACLP Metrics View
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
