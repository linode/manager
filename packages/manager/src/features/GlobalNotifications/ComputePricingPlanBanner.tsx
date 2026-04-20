import { useAllLinodesQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import type { Linode } from '@linode/api-v4';

// Checks if the Linode type is g6, g7, g8, or GPU
const isTargetPlan = (linode: Linode) => {
  if (!linode.type) return false;
  return (
    linode.type.startsWith('g6') ||
    linode.type.startsWith('g7') ||
    linode.type.startsWith('g8') ||
    linode.type.toLowerCase().includes('gpu')
  );
};

export const ComputePricingPlanBanner: React.FC = () => {
  const flags = useFlags();
  const hasBannerText = Boolean(flags.computePricing?.banner?.text);

  const { data: linodes } = useAllLinodesQuery({}, {}, hasBannerText);

  const hasTargetPlan = React.useMemo(
    () => Array.isArray(linodes) && linodes.some(isTargetPlan),
    [linodes]
  );

  // Show banner only if the LD flag banner text is present and a target plan exists
  const showBanner = hasBannerText && hasTargetPlan;

  if (!showBanner) return null;

  return (
    <DismissibleBanner
      preferenceKey="compute-pricing-global-banner"
      variant="info"
    >
      <Typography>
        {flags.computePricing?.banner?.text}{' '}
        {flags.computePricing?.banner.learnMoreLink && (
          <Link to={flags.computePricing?.banner.learnMoreLink}>
            Learn more
          </Link>
        )}
        .
      </Typography>
    </DismissibleBanner>
  );
};
