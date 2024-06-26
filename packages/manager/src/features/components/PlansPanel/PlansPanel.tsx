import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { isDistributedRegionSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionAvailabilityQuery } from 'src/queries/regions/regions';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { DistributedRegionPlanTable } from './DistributedRegionPlanTable';
import { PlanContainer } from './PlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  extractPlansInformation,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
  replaceOrAppendPlaceholder512GbPlans,
} from './utils';

import type { PlanSelectionType } from './types';
import type { LinodeTypeClass, Region } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

export interface PlansPanelProps {
  className?: string;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  disabledSmallerPlans?: PlanSelectionType[];
  disabledTabs?: string[];
  docsLink?: JSX.Element;
  error?: string;
  header?: string;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  regionsData?: Region[];
  selectedId?: string;
  selectedRegionID?: string;
  showLimits?: boolean;
  tabDisabledMessage?: string;
  tabbedPanelInnerClass?: string;
  types: PlanSelectionType[];
}

/**
 * PlansPanel is a tabbed panel that displays a list of plans for a Linode.
 * It is used in the Linode create, Kubernetes and Database create flows.
 * It contains ample logic to determine which plans are available based on the selected region availability and display related visual indicators:
 * - If the region is not supported, show an error notice and disable all plans.
 * - If more than half the plans are disabled, show the limited availability banner and hide the limited availability tooltip
 * - If less than half the plans are disabled, hide the limited availability banner and show the limited availability tooltip
 */
export const PlansPanel = (props: PlansPanelProps) => {
  const {
    className,
    copy,
    currentPlanHeading,
    disabled,
    disabledClasses,
    disabledSmallerPlans,
    docsLink,
    error,
    header,
    isCreate,
    linodeID,
    onSelect,
    regionsData,
    selectedId,
    selectedRegionID,
    showLimits,
    types,
  } = props;

  const flags = useFlags();
  const location = useLocation();
  const params = getQueryParamsFromQueryString(location.search);

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    selectedRegionID || '',
    Boolean(flags.soldOutChips) && selectedRegionID !== undefined
  );

  const _types = types.filter(
    (type) =>
      !type.id.includes('dedicated-edge') && !type.id.includes('nanode-edge')
  );
  const _plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans
      ? replaceOrAppendPlaceholder512GbPlans(_types)
      : _types
  );

  const hideDistributedRegions =
    !flags.gecko2?.enabled ||
    !isDistributedRegionSupported(params.type as LinodeCreateType);

  const showDistributedRegionPlanTable =
    !hideDistributedRegions &&
    getIsDistributedRegion(regionsData ?? [], selectedRegionID ?? '');

  const getDedicatedDistributedRegionPlanType = () => {
    return types.filter(
      (type) =>
        type.id.includes('dedicated-edge') ||
        type.id.includes('nanode-edge') ||
        type.class === 'edge'
    );
  };

  const plans = showDistributedRegionPlanTable
    ? {
        dedicated: getDedicatedDistributedRegionPlanType(),
      }
    : _plans;

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID,
  });

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    const plansMap: PlanSelectionType[] = plans[plan];
    const {
      allDisabledPlans,
      hasMajorityOfPlansDisabled,
      plansForThisLinodeTypeClass,
    } = extractPlansInformation({
      disableLargestGbPlansFlag: flags.disableLargestGbPlans,
      disabledClasses,
      disabledSmallerPlans,
      plans: plansMap,
      regionAvailabilities,
      selectedRegionId: selectedRegionID,
    });

    return {
      disabled: props.disabledTabs ? props.disabledTabs?.includes(plan) : false,
      render: () => {
        return (
          <>
            <PlanInformation
              hideLimitedAvailabilityBanner={
                showDistributedRegionPlanTable ||
                !flags.disableLargestGbPlans ||
                plan === 'metal' // Bare Metal plans handle their own limited availability banner since they are an special case
              }
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              disabledClasses={disabledClasses}
              hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
              hasSelectedRegion={hasSelectedRegion}
              planType={plan}
              regionsData={regionsData || []}
            />
            {showDistributedRegionPlanTable && (
              <Notice
                text="Distributed region pricing is temporarily $0 during the beta period, after which billing will begin."
                variant="warning"
              />
            )}
            <PlanContainer
              allDisabledPlans={allDisabledPlans}
              currentPlanHeading={currentPlanHeading}
              hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
              isCreate={isCreate}
              linodeID={linodeID}
              onSelect={onSelect}
              planType={plan}
              plans={plansForThisLinodeTypeClass}
              selectedId={selectedId}
              selectedRegionId={selectedRegionID}
              showLimits={showLimits}
              wholePanelIsDisabled={disabled || isPlanPanelDisabled(plan)}
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

  if (showDistributedRegionPlanTable) {
    return (
      <DistributedRegionPlanTable
        copy={copy}
        data-qa-select-plan
        docsLink={docsLink}
        error={error}
        header={header || 'Linode Plan'}
        innerClass={props.tabbedPanelInnerClass}
        renderTable={tabs[0].render}
        rootClass={`${className} tabbedPanel`}
        sx={{ width: '100%' }}
      />
    );
  }

  return (
    <TabbedPanel
      copy={copy}
      data-qa-select-plan
      docsLink={docsLink}
      error={error}
      header={header || 'Linode Plan'}
      initTab={initialTab >= 0 ? initialTab : 0}
      innerClass={props.tabbedPanelInnerClass}
      rootClass={`${className} tabbedPanel`}
      sx={{ width: '100%' }}
      tabDisabledMessage={props.tabDisabledMessage}
      tabs={tabs}
    />
  );
};
