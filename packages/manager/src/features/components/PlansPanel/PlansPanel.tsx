import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { plansNoticesUtils } from 'src/utilities/planNotices';

import { PlanContainer } from './PlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';

import type { PlanSelectionType } from './types';
import type { LinodeTypeClass, Region } from '@linode/api-v4';
interface Props {
  className?: string;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
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

  const theme = useTheme();

  const plans = getPlanSelectionsByPlanType(types);
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
      tabs={tabs}
    />
  );
};
