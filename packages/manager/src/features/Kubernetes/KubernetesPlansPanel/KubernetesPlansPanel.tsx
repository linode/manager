import * as React from 'react';

import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { PlanInformation } from 'src/features/components/PlansPanel/PlanInformation';
import {
  determineInitialPlanCategoryTab,
  extractPlansInformation,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
  replaceOrAppendPlaceholder512GbPlans,
} from 'src/features/components/PlansPanel/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionAvailabilityQuery } from 'src/queries/regions/regions';

import { KubernetesPlanContainer } from './KubernetesPlanContainer';

import type { CreateNodePoolData, Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import type { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import type { ExtendedType } from 'src/utilities/extendType';

interface Props {
  addPool?: (pool?: CreateNodePoolData) => void;
  copy?: string;
  currentPlanHeading?: string;
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

  const _types = types.filter(
    (type) =>
      !type.id.includes('dedicated-edge') && !type.id.includes('nanode-edge')
  );

  const plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans
      ? replaceOrAppendPlaceholder512GbPlans(_types)
      : _types
  );

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    const plansMap: PlanSelectionType[] = plans[plan];
    const {
      allDisabledPlans,
      hasMajorityOfPlansDisabled,
      plansForThisLinodeTypeClass,
    } = extractPlansInformation({
      disableLargestGbPlansFlag: flags.disableLargestGbPlans,
      plans: plansMap,
      regionAvailabilities,
      selectedRegionId,
    });

    return {
      render: () => {
        return (
          <>
            <PlanInformation
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
              hasSelectedRegion={hasSelectedRegion}
              planType={plan}
              regionsData={regionsData}
            />
            <KubernetesPlanContainer
              allDisabledPlans={allDisabledPlans}
              getTypeCount={getTypeCount}
              hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
              onAdd={onAdd}
              onSelect={onSelect}
              plans={plansForThisLinodeTypeClass}
              selectedId={selectedId}
              selectedRegionId={selectedRegionId}
              updatePlanCount={updatePlanCount}
              wholePanelIsDisabled={isPlanPanelDisabled(plan)}
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
