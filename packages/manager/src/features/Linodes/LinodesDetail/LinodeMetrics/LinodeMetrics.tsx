import { usePreferences } from '@linode/queries';
import { Box, Notice } from '@linode/ui';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { AclpMetricsPreferenceToggle } from './AclpMetricsPreferenceToggle';
import LinodeSummary from './LinodeSummary/LinodeSummary';

interface Props {
  linodeCreated: string;
}

const LinodeMetrics = ({ linodeCreated }: Props) => {
  const flags = useFlags();
  const { data: isAclpMetricsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );

  return (
    <Box>
      {flags.aclpIntegration ? <AclpMetricsPreferenceToggle /> : null}
      {flags.aclpIntegration && isAclpMetricsPreferenceBeta ? (
        // Beta ACLP Metrics View
        <Notice variant="info">ACLP Metrics Coming soon...</Notice>
      ) : (
        // Legacy Metrics View
        <LinodeSummary linodeCreated={linodeCreated} />
      )}
    </Box>
  );
};

export default LinodeMetrics;
