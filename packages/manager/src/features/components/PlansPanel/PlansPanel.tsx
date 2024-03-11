import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { getIsLinodeCreateTypeEdgeSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { getIsEdgeRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { useFlags } from 'src/hooks/useFlags';
import { plansNoticesUtils } from 'src/utilities/planNotices';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { EdgePlanTable } from './EdgePlanTable';
import { PlanContainer } from './PlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';

import type { PlanSelectionType } from './types';
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
  } = props;

  const flags = useFlags();
  const theme = useTheme();
  const location = useLocation();
  const params = getQueryParamsFromQueryString(location.search);

  const hideEdgeRegions =
    !flags.gecko ||
    !getIsLinodeCreateTypeEdgeSupported(params.type as LinodeCreateType);

  const showEdgePlanTable =
    !hideEdgeRegions &&
    getIsEdgeRegion(regionsData ?? [], selectedRegionID ?? '');

  const planTypes = getPlanSelectionsByPlanType(types);

  const getDedicatedEdgePlanType = () => {
    // 256gb and 512gb plans will not be supported for Edge
    const plansUpTo128GB = planTypes.dedicated.slice(
      0,
      planTypes.dedicated.length - 2
    );

    return plansUpTo128GB.map((plan) => {
      delete plan.transfer;
      return {
        ...plan,
        disk: 0,
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
    : planTypes;

  const {
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
  } = plansNoticesUtils({
    regionsData,
    selectedRegionID,
  });

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      disabled: props.disabledTabs ? props.disabledTabs?.includes(plan) : false,
      render: () => {
        return (
          <>
            <PlanInformation
              isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan(
                plan
              )}
              disabledClasses={props.disabledClasses}
              hasSelectedRegion={hasSelectedRegion}
              planType={plan}
              regionsData={regionsData || []}
            />
            {showEdgePlanTable && (
              <Notice
                text="Edge region pricing is temporarily $0 during the beta period, after which standard pricing will begin."
                variant="warning"
              ></Notice>
            )}
            <PlanContainer
              currentPlanHeading={currentPlanHeading}
              disabled={disabled || isPlanPanelDisabled(plan)}
              disabledClasses={props.disabledClasses}
              isCreate={isCreate}
              linodeID={linodeID}
              onSelect={onSelect}
              plans={plans[plan]}
              selectedDiskSize={props.selectedDiskSize}
              selectedId={selectedId}
              selectedRegionId={selectedRegionID}
              showTransfer={showTransfer}
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
        sx={{ marginTop: theme.spacing(3), width: '100%' }}
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
      sx={{ marginTop: theme.spacing(3), width: '100%' }}
      tabDisabledMessage={props.tabDisabledMessage}
      tabs={tabs}
    />
  );
};
