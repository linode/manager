import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { Notice } from 'src/components/Notice/Notice';
import Typography from 'src/components/core/Typography';
import { useSelectPlanPanelStyles } from './Styles/selectPlanPanelStyles';
import { plansTabContent } from './planTabsContent';
import { GPUNotice } from './GPUNotice';
import { MetalNotice } from './MetalNotice';

interface Props {
  disabledClasses?: LinodeTypeClass[];
  planType: LinodeTypeClass;
}

export const PlanInformation = ({ disabledClasses, planType }: Props) => {
  const { classes } = useSelectPlanPanelStyles();

  const getDisabledClass = (thisClass: string) => {
    const inactiveClasses = (disabledClasses as string[]) ?? []; // Not a big fan of the casting here but it works
    return inactiveClasses.includes(thisClass);
  };

  return (
    <>
      {planType === 'gpu' ? (
        <GPUNotice hasDisabledClass={getDisabledClass('gpu')} />
      ) : null}
      {planType === 'metal' ? (
        <MetalNotice hasDisabledClass={getDisabledClass('metal')} />
      ) : null}
      {planType !== 'gpu' &&
      planType !== 'metal' &&
      plansTabContent[planType]?.notice ? (
        <Notice warning>{plansTabContent[planType].notice}</Notice>
      ) : null}
      <Typography data-qa-prodedi className={classes.copy}>
        {plansTabContent[planType].typography}
      </Typography>
    </>
  );
};
