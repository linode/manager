import * as React from 'react';
import { LinodeTypeClass, BaseType } from '@linode/api-v4/lib/linodes';
import RenderGuard from 'src/components/RenderGuard';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { ExtendedType } from 'src/utilities/extendType';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';
import { PlanContainer } from './PlanContainer';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';
import { PlanInformation } from './PlanInformation';

export interface PlanSelectionType extends BaseType {
  class: ExtendedType['class'];
  formattedLabel: ExtendedType['formattedLabel'];
  heading: ExtendedType['heading'];
  network_out?: ExtendedType['network_out'];
  price: ExtendedType['price'];
  subHeadings: ExtendedType['subHeadings'];
  transfer?: ExtendedType['transfer'];
}
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
  selectedDiskSize?: number;
  selectedID?: string;
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
    selectedID,
    showTransfer,
    types,
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
            <PlanContainer
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
