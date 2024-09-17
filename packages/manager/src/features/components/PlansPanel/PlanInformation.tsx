import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { StyledNoticeTypography } from 'src/features/Linodes/LinodesCreate/PlansAvailabilityNotice.styles';
import { useFlags } from 'src/hooks/useFlags';

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
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import type { Theme } from '@mui/material/styles';

export interface PlanInformationProps {
  disabledClasses?: LinodeTypeClass[];
  hasMajorityOfPlansDisabled: boolean;
  hasSelectedRegion: boolean;
  hideLimitedAvailabilityBanner?: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionsData?: Region[];
}

export const PlanInformation = (props: PlanInformationProps) => {
  const {
    disabledClasses,
    hasMajorityOfPlansDisabled,
    hasSelectedRegion,
    hideLimitedAvailabilityBanner,
    isSelectedRegionEligibleForPlan,
    planType,
    regionsData,
  } = props;
  const theme = useTheme();
  const getDisabledClass = (thisClass: LinodeTypeClass) => {
    return Boolean(disabledClasses?.includes(thisClass));
  };
  const showGPUEgressBanner = Boolean(useFlags().gpuv2?.egressBanner);

  return (
    <>
      {planType === 'gpu' ? (
        <>
          {showGPUEgressBanner && (
            <Notice variant="info">
              <Typography fontFamily={theme.font.bold} fontSize="1rem">
                New GPU instances are now generally available. Deploy an RTX
                4000 Ada GPU instance in select core compute regions in North
                America, Europe, and Asia. <br />
                Receive 1 TB of free included network transfer for a limited
                time. {/* TODO: Add link to GPU egress banner */}
                <Link to="#">Learn more</Link>.
              </Typography>
            </Notice>
          )}
          <PlansAvailabilityNotice
            hasSelectedRegion={hasSelectedRegion}
            isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
            planType={planType}
            regionsData={regionsData || []}
          />
        </>
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
        hasMajorityOfPlansDisabled && (
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
              These plans have limited deployment availability.
            </StyledNoticeTypography>
          </Notice>
        )}
      <ClassDescriptionCopy planType={planType} />
    </>
  );
};

export const limitedAvailabilityBannerTestId = 'limited-availability-banner';

interface ClassDescriptionCopyProps {
  planType: 'shared' | LinodeTypeClass;
}

export const ClassDescriptionCopy = (props: ClassDescriptionCopyProps) => {
  const { planType } = props;
  const theme = useTheme();
  let planTypeLabel: null | string;
  let docLink: null | string;

  switch (planType) {
    case 'dedicated':
      planTypeLabel = 'Dedicated CPU';
      docLink = DEDICATED_COMPUTE_INSTANCES_LINK;
      break;
    case 'shared':
      planTypeLabel = 'Shared CPU';
      docLink = SHARED_COMPUTE_INSTANCES_LINK;
      break;
    case 'highmem':
      planTypeLabel = 'High Memory';
      docLink = HIGH_MEMORY_COMPUTE_INSTANCES_LINK;
      break;
    case 'premium':
      planTypeLabel = 'Premium CPU';
      docLink = PREMIUM_COMPUTE_INSTANCES_LINK;
      break;
    case 'gpu':
      planTypeLabel = 'GPU';
      docLink = GPU_COMPUTE_INSTANCES_LINK;
      break;
    default:
      planTypeLabel = null;
      docLink = null;
  }

  return planTypeLabel && docLink ? (
    <Typography
      sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(1) }}
    >
      {
        planTabInfoContent[planType as keyof typeof planTabInfoContent]
          ?.typography
      }{' '}
      <Link to={docLink}>Learn more</Link> about our {planTypeLabel} plans.
    </Typography>
  ) : null;
};
