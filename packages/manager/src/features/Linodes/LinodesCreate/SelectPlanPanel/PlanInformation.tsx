import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Typography from 'src/components/core/Typography';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';
import { planTabInfoContent } from './utils';
import { GPUNotice } from './GPUNotice';
import { MetalNotice } from './MetalNotice';
import { PremiumPlansAvailabilityNotice } from '../PremiumPlansAvailabilityNotice';

interface Props {
  disabledClasses?: LinodeTypeClass[];
  planType: LinodeTypeClass;
}

export const PlanInformation = ({ disabledClasses, planType }: Props) => {
  const { classes } = useSelectPlanPanelStyles();

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
      {planType === 'premium' ? <PremiumPlansAvailabilityNotice /> : null}
      <Typography data-qa-prodedi className={classes.copy}>
        {planTabInfoContent[planType]?.typography}
      </Typography>
    </>
  );
};
