import { useRegionAvailabilityQuery } from '@linode/queries';
import * as React from 'react';
import type { JSX } from 'react';

import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { PlanInformation } from 'src/features/components/PlansPanel/PlanInformation';
import {
  determineInitialPlanCategoryTab,
  extractPlansInformation,
  getPlanSelectionsByPlanType,
  isMTCPlan,
  planTabInfoContent,
  replaceOrAppendPlaceholder512GbPlans,
} from 'src/features/components/PlansPanel/utils';
import { useFlags } from 'src/hooks/useFlags';

import { KubernetesPlanContainer } from './KubernetesPlanContainer';

import type { NodePoolConfigDrawerHandlerParams } from '../CreateCluster/CreateCluster';
import type {
  CreateNodePoolData,
  KubernetesTier,
  Region,
} from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import type { PlanSelectionType } from 'src/features/components/PlansPanel/types';
import type { ExtendedType } from 'src/utilities/extendType';

interface Props {
  addPool?: (pool?: CreateNodePoolData) => void;
  copy?: string;
  currentPlanHeading?: string;
  error?: string;
  getTypeCount: (planId: string) => number;
  handleConfigurePool?: (params: NodePoolConfigDrawerHandlerParams) => void;
  hasSelectedRegion: boolean;
  header?: string;
  isAPLEnabled?: boolean;
  isPlanPanelDisabled: (planType?: LinodeTypeClass) => boolean;
  isSelectedRegionEligibleForPlan: (planType?: LinodeTypeClass) => boolean;
  isSubmitting?: boolean;
  notice?: JSX.Element;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  regionsData: Region[];
  resetValues: () => void;
  selectedId?: string;
  selectedRegionId?: Region['id'] | string;
  selectedTier: KubernetesTier;
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
    isAPLEnabled,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
    onAdd,
    handleConfigurePool,
    onSelect,
    notice,
    regionsData,
    resetValues,
    selectedId,
    selectedRegionId,
    selectedTier,
    types,
    updatePlanCount,
  } = props;

  const flags = useFlags();

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    selectedRegionId || '',
    Boolean(flags.soldOutChips) && Boolean(selectedRegionId)
  );

  const isPlanDisabledByAPL = (plan: 'shared' | LinodeTypeClass) =>
    plan === 'shared' && Boolean(isAPLEnabled);

  const _types = types.filter((type) => {
    // Do not display MTC plans if the feature flag is not enabled.
    if (!flags.mtc?.enabled && isMTCPlan(type)) {
      return false;
    }

    return (
      !type.id.includes('dedicated-edge') &&
      !type.id.includes('nanode-edge') &&
      // Filter out GPU types for enterprise; otherwise, return the rest of the types.
      // TODO: remove this once GPU plans are supported in LKE-E (Q3 2025)
      (selectedTier === 'enterprise' ? !type.id.includes('gpu') : true) &&
      // Filter out Blackwell plans for kubernetes (for now)
      !(type.id.includes('blackwell') && !flags.kubernetesBlackwellPlans)
    );
  });

  const plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans
      ? replaceOrAppendPlaceholder512GbPlans(_types)
      : _types,
    { isLKE: true }
  );

  const tabs = Object.keys(plans).map(
    (plan: Exclude<LinodeTypeClass, 'nanode' | 'standard'>) => {
      const plansMap: PlanSelectionType[] = plans[plan]!;
      const {
        allDisabledPlans,
        hasMajorityOfPlansDisabled,
        plansForThisLinodeTypeClass,
      } = extractPlansInformation({
        disableLargestGbPlansFlag: flags.disableLargestGbPlans,
        isAPLEnabled,
        plans: plansMap,
        regionAvailabilities,
        selectedRegionId,
      });

      return {
        render: () => {
          return (
            <>
              <PlanInformation
                flow="kubernetes"
                hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
                hasSelectedRegion={hasSelectedRegion}
                isAPLEnabled={isAPLEnabled}
                isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                  plan
                )}
                planType={plan}
                regionsData={regionsData}
              />
              <KubernetesPlanContainer
                allDisabledPlans={allDisabledPlans}
                getTypeCount={getTypeCount}
                handleConfigurePool={handleConfigurePool}
                hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={plansForThisLinodeTypeClass}
                planType={plan}
                selectedId={selectedId}
                selectedRegionId={selectedRegionId}
                selectedTier={selectedTier}
                updatePlanCount={updatePlanCount}
                wholePanelIsDisabled={
                  isPlanPanelDisabled(plan) || isPlanDisabledByAPL(plan)
                }
              />
            </>
          );
        },
        title: planTabInfoContent[plan]?.title,
      };
    }
  );

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
      notice={notice}
      sx={{ padding: 0 }}
      tabs={tabs}
    />
  );
};
