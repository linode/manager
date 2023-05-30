import * as React from 'react';
import { LinodeTypeClass, BaseType } from '@linode/api-v4/lib/linodes';
import { LDClient } from 'launchdarkly-js-client-sdk';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import { ExtendedType } from 'src/utilities/extendType';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';
import { RenderPlanContainer } from './PlanContainer';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';
import { PlanInformation } from './PlanInformation';

export interface PlanSelectionType extends BaseType {
  formattedLabel: ExtendedType['formattedLabel'];
  class: ExtendedType['class'];
  heading: ExtendedType['heading'];
  subHeadings: ExtendedType['subHeadings'];
  price: ExtendedType['price'];
  transfer?: ExtendedType['transfer'];
  network_out?: ExtendedType['network_out'];
}
interface Props {
  types: PlanSelectionType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  linodeID?: number | undefined;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  disabledClasses?: LinodeTypeClass[];
  tabbedPanelInnerClass?: string;
  ldClient?: LDClient;
  isCreate?: boolean;
  className?: string;
  showTransfer?: boolean;
  docsLink?: JSX.Element;
}

export const PlansPanel = (props: Props) => {
  const {
    selectedID,
    currentPlanHeading,
    disabled,
    isCreate,
    header,
    linodeID,
    showTransfer,
    types,
    className,
    copy,
    error,
    docsLink,
  } = props;

  const { classes } = useSelectPlanPanelStyles();

  const plans = getPlanSelectionsByPlanType(types);

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      render: () => {
        return (
          <>
            <PlanInformation
              disabledClasses={props.disabledClasses}
              planType={plan}
            />
            <RenderPlanContainer
              isCreate={isCreate}
              plans={plans[plan]}
              showTransfer={showTransfer}
              selectedDiskSize={props.selectedDiskSize}
              currentPlanHeading={currentPlanHeading}
              disabledClasses={props.disabledClasses}
              disabled={disabled}
              selectedID={selectedID}
              linodeID={linodeID}
              onSelect={props.onSelect}
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
      rootClass={`${classes.root} ${className} tabbedPanel`}
      innerClass={props.tabbedPanelInnerClass}
      error={error}
      header={header || 'Linode Plan'}
      copy={copy}
      tabs={tabs}
      initTab={initialTab >= 0 ? initialTab : 0}
      docsLink={docsLink}
      data-qa-select-plan
    />
  );
};

export default RenderGuard(PlansPanel);
