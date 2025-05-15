import { Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StyledNoticeTypography } from 'src/features/components/PlansPanel/PlansAvailabilityNotice.styles';
import { useFlags } from 'src/hooks/useFlags';

import { APLNotice } from './APLNotice';
import {
  ACCELERATED_COMPUTE_INSTANCES_LINK,
  DEDICATED_COMPUTE_INSTANCES_LINK,
  GPU_COMPUTE_INSTANCES_LINK,
  HIGH_MEMORY_COMPUTE_INSTANCES_LINK,
  PREMIUM_COMPUTE_INSTANCES_LINK,
  SHARED_COMPUTE_INSTANCES_LINK,
  TRANSFER_COSTS_LINK,
} from './constants';
import { MetalNotice } from './MetalNotice';
import { PlansAvailabilityNotice } from './PlansAvailabilityNotice';
import { planTabInfoContent } from './utils';

import type { Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import type { Theme } from '@mui/material/styles';

interface ExtendedPlanType {
  planType: 'shared' | LinodeTypeClass;
}

export interface PlanInformationProps extends ExtendedPlanType {
  disabledClasses?: LinodeTypeClass[];
  flow: 'kubernetes' | 'linode';
  hasMajorityOfPlansDisabled: boolean;
  hasSelectedRegion: boolean;
  hideLimitedAvailabilityBanner?: boolean;
  isAPLEnabled?: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  regionsData?: Region[];
}

export const PlanInformation = (props: PlanInformationProps) => {
  const {
    disabledClasses,
    flow,
    hasMajorityOfPlansDisabled,
    hasSelectedRegion,
    hideLimitedAvailabilityBanner,
    isAPLEnabled,
    isSelectedRegionEligibleForPlan,
    planType,
    regionsData,
  } = props;
  const getDisabledClass = (thisClass: LinodeTypeClass) => {
    return Boolean(disabledClasses?.includes(thisClass));
  };
  const showGPUEgressBanner = Boolean(useFlags().gpuv2?.egressBanner);
  const showTransferBanner = Boolean(useFlags().gpuv2?.transferBanner);

  const showLimitedAvailabilityBanner =
    hasSelectedRegion &&
    isSelectedRegionEligibleForPlan &&
    !hideLimitedAvailabilityBanner &&
    hasMajorityOfPlansDisabled;

  const transferBanner = (
    <Notice spacingBottom={8} variant="warning">
      <Typography fontSize="1rem" sx={(theme) => ({ font: theme.font.bold })}>
        Some plans do not include bundled network transfer. If the transfer
        allotment is 0, all outbound network transfer is subject to charges.
        <br />
        <Link to={TRANSFER_COSTS_LINK}>Learn more about transfer costs</Link>.
      </Typography>
    </Notice>
  );

  return (
    <>
      {planType === 'gpu' ? (
        <>
          {showGPUEgressBanner && (
            <Notice spacingBottom={8} variant="info">
              <Typography
                fontSize="1rem"
                sx={(theme) => ({ font: theme.font.bold })}
              >
                New GPU instances are now generally available. Deploy an RTX
                4000 Ada GPU instance in select core compute regions in North
                America, Europe, and Asia. <br />
                Receive 1 TB of free included network transfer for a limited
                time.{' '}
                <Link to="https://www.linode.com/blog/compute/new-gpus-nvidia-rtx-4000-ada-generation">
                  Learn more
                </Link>
                .
              </Typography>
            </Notice>
          )}
          {showTransferBanner && flow === 'linode' && transferBanner}
          <PlansAvailabilityNotice
            hasSelectedRegion={hasSelectedRegion}
            isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
            planType={planType}
            regionsData={regionsData || []}
          />
        </>
      ) : null}
      {planType === 'accelerated' && (
        <>
          {transferBanner}
          <PlansAvailabilityNotice
            hasSelectedRegion={hasSelectedRegion}
            isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
            planType={planType}
            regionsData={regionsData || []}
          />
        </>
      )}
      {planType === 'metal' ? (
        <MetalNotice
          dataTestId="metal-notice"
          hasDisabledClass={getDisabledClass('metal')}
        />
      ) : null}
      {planType === 'shared' && isAPLEnabled ? (
        <APLNotice dataTestId="apl-notice" />
      ) : null}
      {planType === 'premium' ? (
        <PlansAvailabilityNotice
          hasSelectedRegion={hasSelectedRegion}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          planType={planType}
          regionsData={regionsData || []}
        />
      ) : null}
      {showLimitedAvailabilityBanner && (
        <Notice
          dataTestId={limitedAvailabilityBannerTestId}
          sx={(theme: Theme) => ({
            marginBottom: theme.spacing(3),
            marginLeft: 0,
            marginTop: 0,
            padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
          })}
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

export const ClassDescriptionCopy = (props: ExtendedPlanType) => {
  const { planType } = props;
  let planTypeLabel: null | string;
  let docLink: null | string;

  switch (planType) {
    case 'accelerated':
      planTypeLabel = 'Accelerated';
      docLink = ACCELERATED_COMPUTE_INSTANCES_LINK;
      break;
    case 'dedicated':
      planTypeLabel = 'Dedicated CPU';
      docLink = DEDICATED_COMPUTE_INSTANCES_LINK;
      break;
    case 'gpu':
      planTypeLabel = 'GPU';
      docLink = GPU_COMPUTE_INSTANCES_LINK;
      break;
    case 'highmem':
      planTypeLabel = 'High Memory';
      docLink = HIGH_MEMORY_COMPUTE_INSTANCES_LINK;
      break;
    case 'premium':
      planTypeLabel = 'Premium CPU';
      docLink = PREMIUM_COMPUTE_INSTANCES_LINK;
      break;
    case 'shared':
      planTypeLabel = 'Shared CPU';
      docLink = SHARED_COMPUTE_INSTANCES_LINK;
      break;
    default:
      planTypeLabel = null;
      docLink = null;
  }

  return planTypeLabel && docLink ? (
    <Typography
      sx={(theme: Theme) => ({
        marginBottom: theme.spacing(3),
        marginTop: theme.spacing(1),
      })}
    >
      {
        planTabInfoContent[planType as keyof typeof planTabInfoContent]
          ?.typography
      }{' '}
      <Link to={docLink}>Learn more</Link> about our {planTypeLabel} plans.
    </Typography>
  ) : null;
};
