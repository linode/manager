import { useAllLinodesQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import type { Linode } from '@linode/api-v4';

const TARGET_PLAN_MATCHERS = ['g6', 'g7', 'g8', 'gpu'];

// Checks if the Linode type matches any targeted plan matcher
const isTargetPlan = (linode: Linode, targetPlanMatchers: string[]) => {
  const linodeType = linode.type;
  if (!linodeType) return false;

  return targetPlanMatchers.some((matcher) =>
    linodeType.includes(matcher.toLowerCase())
  );
};

export const ComputePricingPlanBanner = () => {
  const flags = useFlags();
  const hasBannerText = Boolean(flags.computePricing?.banner.text);

  // Fetch all Linodes only when LD flag banner text is present
  const { data: linodes } = useAllLinodesQuery({}, {}, hasBannerText);

  const hasTargetPlan = React.useMemo(
    () =>
      Array.isArray(linodes) &&
      linodes.some((linode) => isTargetPlan(linode, TARGET_PLAN_MATCHERS)),
    [linodes]
  );

  // Show banner only if the LD flag banner text is present and a targeted plan exists
  const showBanner = hasBannerText && hasTargetPlan;

  if (!showBanner) return null;

  return (
    <DismissibleBanner
      preferenceKey="compute-pricing-global-banner"
      variant="info"
    >
      <Typography>
        {flags.computePricing?.banner.text}{' '}
        {flags.computePricing?.banner.learnMoreLink && (
          <Link to={flags.computePricing?.banner.learnMoreLink}>
            Learn more
          </Link>
        )}
      </Typography>
    </DismissibleBanner>
  );
};
