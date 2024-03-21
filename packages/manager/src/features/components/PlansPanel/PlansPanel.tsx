import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { getIsLinodeCreateTypeEdgeSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { getIsEdgeRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionAvailabilityQuery } from 'src/queries/regions/regions';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { EdgePlanTable } from './EdgePlanTable';
import { PlanContainer } from './PlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getIsLimitedAvailability,
  getPlanSelectionsByPlanType,
  isMajorityLimitedAvailabilityPlans,
  planTabInfoContent,
  replaceOrAppendPlaceholder512GbPlans,
} from './utils';

import type { PlanSelectionType, TypeWithAvailability } from './types';
import type { LinodeTypeClass, Region } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

interface Props {
  className?: string;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  disabledTabs?: string[];
  docsLink?: JSX.Element;
  error?: string;
  header?: string;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  regionsData?: Region[];
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionID?: string;
  showTransfer?: boolean;
  tabDisabledMessage?: string;
  tabbedPanelInnerClass?: string;
  types: PlanSelectionType[];
  disabledPlanTypes?: PlanSelectionType[];
  disabledPlanTypesToolTipText?: string;
}

export const PlansPanel = (props: Props) => {
  const {
    className,
    copy,
    currentPlanHeading,
    disabled,
    docsLink,
    error,
    header,
    isCreate,
    linodeID,
    onSelect,
    regionsData,
    selectedId,
    selectedRegionID,
    showTransfer,
    types,
    disabledPlanTypes,
    disabledPlanTypesToolTipText,
  } = props;

  const flags = useFlags();
  const location = useLocation();
  const params = getQueryParamsFromQueryString(location.search);

  const { data: regionAvailabilities } = useRegionAvailabilityQuery(
    selectedRegionID || '',
    Boolean(flags.soldOutChips) && selectedRegionID !== undefined
  );

  const _types = replaceOrAppendPlaceholder512GbPlans(types);
  const _plans = getPlanSelectionsByPlanType(
    flags.disableLargestGbPlans ? _types : types
  );

  const hideEdgeRegions =
    !flags.gecko ||
    !getIsLinodeCreateTypeEdgeSupported(params.type as LinodeCreateType);

  const showEdgePlanTable =
    !hideEdgeRegions &&
    getIsEdgeRegion(regionsData ?? [], selectedRegionID ?? '');

  const getDedicatedEdgePlanType = () => {
    // 256GB and 512GB plans will not be supported for Edge
    const plansUpTo128GB = _plans.dedicated.filter(
      (planType) =>
        !['Dedicated 256 GB', 'Dedicated 512 GB'].includes(
          planType.formattedLabel
        )
    );

    return plansUpTo128GB.map((plan) => {
      delete plan.transfer;
      return {
        ...plan,
        price: {
          hourly: 0,
          monthly: 0,
        },
      };
    });
  };

  // @TODO Gecko: Get plan data from API when it's available instead of hardcoding
  const plans = showEdgePlanTable
    ? {
        dedicated: getDedicatedEdgePlanType(),
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
    const _plansForThisLinodeTypeClass: PlanSelectionType[] = plans[plan];
    const plansForThisLinodeTypeClass: TypeWithAvailability[] = _plansForThisLinodeTypeClass.map(
      (plan) => {
        return {
          ...plan,
          isLimitedAvailabilityPlan: getIsLimitedAvailability({
            plan,
            regionAvailabilities,
            selectedRegionId: selectedRegionID,
          }),
        };
      }
    );

    const mostClassPlansAreLimitedAvailability = isMajorityLimitedAvailabilityPlans(
      plansForThisLinodeTypeClass
    );

    return {
      disabled: props.disabledTabs ? props.disabledTabs?.includes(plan) : false,
      render: () => {
        return (
          <>
            <PlanInformation
              hideLimitedAvailabilityBanner={
                showEdgePlanTable || !flags.disableLargestGbPlans
              }
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              mostClassPlansAreLimitedAvailability={
                mostClassPlansAreLimitedAvailability
              }
              disabledClasses={props.disabledClasses}
              hasSelectedRegion={hasSelectedRegion}
              planType={plan}
              regionsData={regionsData || []}
            />
            {showEdgePlanTable && (
              <Notice
                text="Edge region pricing is temporarily $0 during the beta period, after which billing will begin."
                variant="warning"
              />
            )}
            <PlanContainer
              hideDisabledHelpIcons={
                mostClassPlansAreLimitedAvailability &&
                flags.disableLargestGbPlans
              } // Making it conditional on the flag avoids scenario w/ flag off where all plans on a tab could be disabled with no explanation
              currentPlanHeading={currentPlanHeading}
              disabled={disabled || isPlanPanelDisabled(plan)}
              disabledClasses={props.disabledClasses}
              isCreate={isCreate}
              linodeID={linodeID}
              onSelect={onSelect}
              plans={plansForThisLinodeTypeClass}
              selectedDiskSize={props.selectedDiskSize}
              selectedId={selectedId}
              selectedRegionId={selectedRegionID}
              showTransfer={showTransfer}
              disabledPlanTypes={disabledPlanTypes}
              disabledPlanTypesToolTipText={disabledPlanTypesToolTipText}
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

  if (showEdgePlanTable) {
    return (
      <EdgePlanTable
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
