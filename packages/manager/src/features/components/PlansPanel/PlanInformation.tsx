import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { StyledNoticeTypography } from 'src/features/Linodes/LinodesCreate/PlansAvailabilityNotice.styles';

import { PlansAvailabilityNotice } from '../../Linodes/LinodesCreate/PlansAvailabilityNotice';
import {
  DEDICATED_COMPUTE_INSTANCES_LINK,
  GPU_COMPUTE_INSTANCES_LINK,
  HIGH_MEMORY_COMPUTE_INSTANCES_LINK,
  PREMIUM_COMPUTE_INSTANCES_LINK,
  SHARED_COMPUTE_INSTANCES_LINK,
} from './constants';
import { MetalNotice } from './MetalNotice';
import { planTabInfoContent } from './utils';

import type { Region } from '@linode/api-v4';

export interface PlanInformationProps {
  disabledClasses?: LinodeTypeClass[];
  hasDisabledPlans: boolean;
  hasSelectedRegion: boolean;
  hideLimitedAvailabilityBanner?: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionsData?: Region[];
}

export const PlanInformation = (props: PlanInformationProps) => {
  const theme = useTheme();
  const {
    disabledClasses,
    hasDisabledPlans,
    hasSelectedRegion,
    hideLimitedAvailabilityBanner,
    isSelectedRegionEligibleForPlan,
    planType,
    regionsData,
  } = props;

  const getDisabledClass = (thisClass: LinodeTypeClass) => {
    return Boolean(disabledClasses?.includes(thisClass));
  };

  return (
    <>
      {planType === 'gpu' ? (
        <PlansAvailabilityNotice
          hasSelectedRegion={hasSelectedRegion}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          planType={planType}
          regionsData={regionsData || []}
        />
      ) : null}
      {planType === 'metal' ? (
        <MetalNotice
          dataTestId="metal-notice"
          hasDisabledClass={getDisabledClass('metal')}
        />
      ) : null}
      {planType === 'premium' ? (
        <PlansAvailabilityNotice
          hasSelectedRegion={hasSelectedRegion}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          planType={planType}
          regionsData={regionsData || []}
        />
      ) : null}
      {hasSelectedRegion &&
        isSelectedRegionEligibleForPlan &&
        !hideLimitedAvailabilityBanner && (
          <LimitedAvailabilityNotice
            hasDisabledPlans={hasDisabledPlans}
            planType={planType}
          />
        )}
      <Typography
        data-qa-prodedi
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(1) }}
      >
        {planTabInfoContent[planType]?.typography}
      </Typography>
    </>
  );
};

export const limitedAvailabilityBannerTestId = 'limited-availability-banner';

interface LimitedAvailabilityNoticeProps {
  hasDisabledPlans: boolean;
  planType: 'shared' | LinodeTypeClass;
}

export const LimitedAvailabilityNotice = (
  props: LimitedAvailabilityNoticeProps
) => {
  const { hasDisabledPlans, planType } = props;

  switch (planType) {
    case 'dedicated':
      return (
        <LimitedAvailabilityNoticeCopy
          docsLink={DEDICATED_COMPUTE_INSTANCES_LINK}
          hasDisabledPlans={hasDisabledPlans}
          planTypeLabel="Dedicated CPU"
        />
      );

    case 'shared':
      return (
        <LimitedAvailabilityNoticeCopy
          docsLink={SHARED_COMPUTE_INSTANCES_LINK}
          hasDisabledPlans={hasDisabledPlans}
          planTypeLabel="Shared CPU"
        />
      );

    case 'highmem':
      return (
        <LimitedAvailabilityNoticeCopy
          docsLink={HIGH_MEMORY_COMPUTE_INSTANCES_LINK}
          hasDisabledPlans={hasDisabledPlans}
          planTypeLabel="High Memory"
        />
      );

    case 'premium':
      return (
        <LimitedAvailabilityNoticeCopy
          docsLink={PREMIUM_COMPUTE_INSTANCES_LINK}
          hasDisabledPlans={hasDisabledPlans}
          planTypeLabel="Premium CPU"
        />
      );

    case 'gpu':
      return (
        <LimitedAvailabilityNoticeCopy
          docsLink={GPU_COMPUTE_INSTANCES_LINK}
          hasDisabledPlans={hasDisabledPlans}
          planTypeLabel="GPU"
        />
      );

    default:
      return null;
  }
};

interface LimitedAvailabilityNoticeCopyProps {
  docsLink: string;
  hasDisabledPlans: boolean;
  planTypeLabel: string;
}

export const LimitedAvailabilityNoticeCopy = (
  props: LimitedAvailabilityNoticeCopyProps
) => {
  const { docsLink, hasDisabledPlans, planTypeLabel } = props;

  return hasDisabledPlans ? (
    <Notice
      sx={(theme: Theme) => ({
        marginBottom: theme.spacing(3),
        marginLeft: 0,
        marginTop: 0,
        padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
      })}
      dataTestId={limitedAvailabilityBannerTestId}
      variant="warning"
    >
      <StyledNoticeTypography>
        These plans have limited deployment availability.{' '}
        <Link to={docsLink}>Learn more</Link> about our {planTypeLabel} plans.
      </StyledNoticeTypography>
    </Notice>
  ) : null;
};
