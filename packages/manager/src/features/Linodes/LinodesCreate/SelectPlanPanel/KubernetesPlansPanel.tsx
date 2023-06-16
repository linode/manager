import * as React from 'react';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { ExtendedType } from 'src/utilities/extendType';
import { KubernetesPlanContainer } from './KubernetesPlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';
import type { CreateNodePoolData, Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  root: {
    padding: 0,
  },
}));

interface Props {
  addPool?: (pool?: CreateNodePoolData) => void;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  error?: string;
  getTypeCount: (planId: string) => number;
  hasSelectedRegion: boolean;
  header?: string;
  isPremiumPlanPanelDisabled: (planType?: LinodeTypeClass) => boolean;
  isSelectedRegionPremium: boolean;
  isSubmitting?: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  regionsData: Region[];
  resetValues: () => void;
  selectedID?: string;
  types: ExtendedType[];
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlansPanel = ({
  copy,
  disabled,
  error,
  hasSelectedRegion,
  header,
  isPremiumPlanPanelDisabled,
  isSelectedRegionPremium,
  onAdd,
  regionsData,
  updatePlanCount,
  types,
  resetValues,
  currentPlanHeading,
  getTypeCount,
  onSelect,
  selectedID,
}: Props) => {
  const { classes, cx } = useStyles();

  const plans = getPlanSelectionsByPlanType(types);

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      render: () => {
        return (
          <>
            <PlanInformation
              planType={plan}
              hasSelectedRegion={hasSelectedRegion}
              isSelectedRegionPremium={isSelectedRegionPremium}
              regionsData={regionsData}
            />
            <KubernetesPlanContainer
              disabled={disabled || isPremiumPlanPanelDisabled(plan)}
              getTypeCount={getTypeCount}
              onAdd={onAdd}
              onSelect={onSelect}
              plans={plans[plan]}
              selectedID={selectedID}
              updatePlanCount={updatePlanCount}
            />
          </>
        );
      },
      title: planTabInfoContent[plan === 'standard' ? 'shared' : plan]?.title,
    };
  });

  const initialTab = determineInitialPlanCategoryTab(
    types,
    selectedID,
    currentPlanHeading
  );

  return (
    <TabbedPanel
      rootClass={cx(classes.root)}
      copy={copy}
      error={error}
      handleTabChange={() => resetValues()}
      header={header || ' '}
      initTab={initialTab >= 0 ? initialTab : 0}
      tabs={tabs}
    />
  );
};

export default KubernetesPlansPanel;
