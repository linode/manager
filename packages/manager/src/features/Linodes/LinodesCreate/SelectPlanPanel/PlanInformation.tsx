import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { MetalNotice } from './MetalNotice';
import { planTabInfoContent } from './utils';
import { PlansAvailabilityNotice } from '../PlansAvailabilityNotice';
import type { Region } from '@linode/api-v4';
import { useTheme } from '@mui/material/styles';

export interface PlanInformationProps {
  disabledClasses?: LinodeTypeClass[];
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionsData?: Region[];
}

export const PlanInformation = (props: PlanInformationProps) => {
  const theme = useTheme();
  const {
    disabledClasses,
    hasSelectedRegion,
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
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          hasSelectedRegion={hasSelectedRegion}
          regionsData={regionsData || []}
          planType={planType}
        />
      ) : null}
      {planType === 'metal' ? (
        <MetalNotice
          hasDisabledClass={getDisabledClass('metal')}
          dataTestId="metal-notice"
        />
      ) : null}
      {planType === 'premium' ? (
        <PlansAvailabilityNotice
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          hasSelectedRegion={hasSelectedRegion}
          regionsData={regionsData || []}
          planType={planType}
        />
      ) : null}
      <Typography
        data-qa-prodedi
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(1) }}
      >
        {planTabInfoContent[planType]?.typography}
      </Typography>
    </>
  );
};
