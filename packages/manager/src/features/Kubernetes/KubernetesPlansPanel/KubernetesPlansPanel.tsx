import * as React from 'react';

import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { PlanInformation } from 'src/features/components/PlansPanel/PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
  replaceOrAppend512GbPlans,
} from 'src/features/components/PlansPanel/utils';
import { useFlags } from 'src/hooks/useFlags';
import { ExtendedType } from 'src/utilities/extendType';

import { KubernetesPlanContainer } from './KubernetesPlanContainer';

import type { CreateNodePoolData, Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';

interface Props {
  addPool?: (pool?: CreateNodePoolData) => void;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  error?: string;
  getTypeCount: (planId: string) => number;
  hasSelectedRegion: boolean;
  header?: string;
  isPlanPanelDisabled: (planType?: LinodeTypeClass) => boolean;
  isSelectedRegionEligibleForPlan: (planType?: LinodeTypeClass) => boolean;
  isSubmitting?: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  regionsData: Region[];
  resetValues: () => void;
  selectedId?: string;
  selectedRegionId?: Region['id'] | string;
  types: ExtendedType[];
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlansPanel = (props: Props) => {
  const {
    copy,
    currentPlanHeading,
    disabled,
    error,
    getTypeCount,
    hasSelectedRegion,
    header,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
    onAdd,
    onSelect,
    regionsData,
    resetValues,
    selectedId,
    selectedRegionId,
    types,
    updatePlanCount,
  } = props;

  const flags = useFlags();

  const _types = replaceOrAppend512GbPlans(types);
  const plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans ? _types : types
  );

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      render: () => {
        return (
          <>
            <PlanInformation
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              hasSelectedRegion={hasSelectedRegion}
              planType={plan}
              regionsData={regionsData}
            />
            <KubernetesPlanContainer
              disabled={disabled || isPlanPanelDisabled(plan)}
              getTypeCount={getTypeCount}
              onAdd={onAdd}
              onSelect={onSelect}
              plans={plans[plan]}
              selectedId={selectedId}
              selectedRegionId={selectedRegionId}
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
    selectedId,
    currentPlanHeading
  );

  return (
    <TabbedPanel
      copy={copy}
      error={error}
      handleTabChange={() => resetValues()}
      header={header || ' '}
      initTab={initialTab >= 0 ? initialTab : 0}
      sx={{ padding: 0 }}
      tabs={tabs}
    />
  );
};
