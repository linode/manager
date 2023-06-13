import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { GPUNotice } from './GPUNotice';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { MetalNotice } from './MetalNotice';
import { planTabInfoContent } from './utils';
import { PremiumPlansAvailabilityNotice } from '../PremiumPlansAvailabilityNotice';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';
import type { Region } from '@linode/api-v4';

interface Props {
  disabledClasses?: LinodeTypeClass[];
  hasSelectedRegion?: boolean;
  isSelectedRegionPremium?: boolean;
  planType: LinodeTypeClass;
  regionsData?: Region[];
}

export const PlanInformation = (props: Props) => {
  const { classes } = useSelectPlanPanelStyles();
  const {
    disabledClasses,
    hasSelectedRegion,
    isSelectedRegionPremium,
    planType,
    regionsData,
  } = props;

  const getDisabledClass = (thisClass: LinodeTypeClass) => {
    return Boolean(disabledClasses?.includes(thisClass));
  };

  return (
    <>
      {planType === 'gpu' ? (
        <GPUNotice
          hasDisabledClass={getDisabledClass('gpu')}
          dataTestId={'gpu-notice'}
        />
      ) : null}
      {planType === 'metal' ? (
        <MetalNotice
          hasDisabledClass={getDisabledClass('metal')}
          dataTestId="metal-notice"
        />
      ) : null}
      {planType === 'premium' ? (
        <PremiumPlansAvailabilityNotice
          isSelectedRegionPremium={isSelectedRegionPremium}
          hasSelectedRegion={hasSelectedRegion}
          regionsData={regionsData}
        />
      ) : null}
      <Typography data-qa-prodedi className={classes.copy}>
        {planTabInfoContent[planType]?.typography}
      </Typography>
    </>
  );
};
