import * as React from 'react';

import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { PlanInformation } from 'src/features/components/PlansPanel/PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getIsLimitedAvailability,
  getPlanSelectionsByPlanType,
  isMajorityLimitedAvailabilityPlans,
  planTabInfoContent,
  replaceOrAppendPlaceholder512GbPlans,
} from 'src/features/components/PlansPanel/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionAvailabilityQuery } from 'src/queries/regions/regions';
import { ExtendedType } from 'src/utilities/extendType';

import { KubernetesPlanContainer } from './KubernetesPlanContainer';

import type { CreateNodePoolData, Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import type {
  PlanSelectionType,
  TypeWithAvailability,
} from 'src/features/components/PlansPanel/types';

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

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    selectedRegionId || '',
    Boolean(flags.soldOutChips) && selectedRegionId !== undefined
  );

  const _types = replaceOrAppendPlaceholder512GbPlans(types);
  const plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans ? _types : types
  );

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    const _plansForThisLinodeTypeClass: PlanSelectionType[] = plans[plan];
    const plansForThisLinodeTypeClass: TypeWithAvailability[] = _plansForThisLinodeTypeClass.map(
      (plan) => {
        return {
          ...plan,
          isLimitedAvailabilityPlan: getIsLimitedAvailability({
            plan,
            regionAvailabilities,
            selectedRegionId,
          }),
        };
      }
    );

    const mostClassPlansAreLimitedAvailability = isMajorityLimitedAvailabilityPlans(
      plansForThisLinodeTypeClass
    );

    return {
      render: () => {
        return (
          <>
            <PlanInformation
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              mostClassPlansAreLimitedAvailability={
                mostClassPlansAreLimitedAvailability
              }
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
