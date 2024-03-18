import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { StyledNoticeTypography } from 'src/features/Linodes/LinodesCreate/PlansAvailabilityNotice.styles';

import { PlansAvailabilityNotice } from '../../Linodes/LinodesCreate/PlansAvailabilityNotice';
import {
  DEDICATED_COMPUTE_INSTANCES_LINK,
  GPU_COMPUTE_INSTANCES_LINK,
  LIMITED_AVAILABILITY_DISMISSIBLEBANNER_KEY,
  PREMIUM_COMPUTE_INSTANCES_LINK,
} from './constants';
import { MetalNotice } from './MetalNotice';
import { planTabInfoContent } from './utils';

import type { Region } from '@linode/api-v4';

export interface PlanInformationProps {
  disabledClasses?: LinodeTypeClass[];
  hasSelectedRegion: boolean;
  hideLimitedAvailabilityBanner?: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  mostClassPlansAreLimitedAvailability?: boolean;
  planType: LinodeTypeClass;
  regionsData?: Region[];
}

export const PlanInformation = (props: PlanInformationProps) => {
  const theme = useTheme();
  const {
    disabledClasses,
    hasSelectedRegion,
    hideLimitedAvailabilityBanner,
    isSelectedRegionEligibleForPlan,
    mostClassPlansAreLimitedAvailability,
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
        !hideLimitedAvailabilityBanner &&
        generateLimitedAvailabilityJsx(
          planType,
          Boolean(mostClassPlansAreLimitedAvailability)
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

export const limitedAvailabilityBannerTestId =
  'limited-availability-dismissible-banner';

export const determineLimitedAvailabilityNoticeCopy = (
  mostClassPlansAreLimitedAvailability: boolean,
  docsLink: string
) => {
  return (
    <DismissibleBanner
      sx={(theme: Theme) => ({
        marginBottom: theme.spacing(3),
        marginLeft: 0,
        marginTop: 0,
        padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
      })}
      dataTestId={limitedAvailabilityBannerTestId}
      preferenceKey={LIMITED_AVAILABILITY_DISMISSIBLEBANNER_KEY}
      variant="warning"
    >
      {mostClassPlansAreLimitedAvailability ? (
        <StyledNoticeTypography>
          These plans have limited availability.{' '}
          <Link to={docsLink}>Learn more</Link>.
        </StyledNoticeTypography>
      ) : (
        <StyledNoticeTypography>
          <Link to={docsLink}>Learn more</Link> about plans and availability.
        </StyledNoticeTypography>
      )}
    </DismissibleBanner>
  );
};

export const generateLimitedAvailabilityJsx = (
  planType: LinodeTypeClass,
  mostClassPlansAreLimitedAvailability: boolean
) => {
  switch (planType) {
    case 'dedicated':
      return determineLimitedAvailabilityNoticeCopy(
        mostClassPlansAreLimitedAvailability,
        DEDICATED_COMPUTE_INSTANCES_LINK
      );

    case 'premium':
      return determineLimitedAvailabilityNoticeCopy(
        mostClassPlansAreLimitedAvailability,
        PREMIUM_COMPUTE_INSTANCES_LINK
      );

    case 'gpu':
      return determineLimitedAvailabilityNoticeCopy(
        mostClassPlansAreLimitedAvailability,
        GPU_COMPUTE_INSTANCES_LINK
      );

    default:
      return null;
  }
};
