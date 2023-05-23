import * as React from 'react';
import { LinodeTypeClass, BaseType } from '@linode/api-v4/lib/linodes';
import { LDClient } from 'launchdarkly-js-client-sdk';
import { pathOr } from 'ramda';
import { Notice } from 'src/components/Notice/Notice';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import Typography from 'src/components/core/Typography';
import { ExtendedType } from 'src/utilities/extendType';
import { getPlanSelectionsByPlanType } from 'src/utilities/filterPlanSelectionsByType';
import { RenderPlanContainer } from './SelectPlanPanel/RenderPlanContainer';
import { useSelectPlanPanelStyles } from './SelectPlanPanel/Styles/selectPlanPanelStyles';
import { plansTabContent } from './SelectPlanPanel/generateTabs';
import { GPUNotice } from './SelectPlanPanel/GPUNotice';
import { MetalNotice } from './SelectPlanPanel/MetalNotice';
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

export const SelectPlanPanel = (props: Props) => {
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

  const getDisabledClass = (thisClass: string) => {
    const disabledClasses = (props.disabledClasses as string[]) ?? []; // Not a big fan of the casting here but it works
    return disabledClasses.includes(thisClass);
  };

  const plans = getPlanSelectionsByPlanType(types);
  const tabOrder: LinodeTypeClass[] = Object.keys(plans).map((plan) =>
    plan === 'shared' ? 'standard' : (plan as LinodeTypeClass)
  );

  const tabs = Object.keys(plans).map((plan) => {
    return {
      render: () => {
        return (
          <>
            {plan === 'gpu' ? (
              <GPUNotice hasDisabledClass={getDisabledClass('gpu')} />
            ) : null}
            {plan === 'metal' ? (
              <MetalNotice hasDisabledClass={getDisabledClass('metal')} />
            ) : null}
            {plan !== 'gpu' &&
            plan !== 'metal' &&
            plansTabContent[plan]?.notice ? (
              <Notice warning>{plansTabContent[plan].notice}</Notice>
            ) : null}
            <Typography data-qa-prodedi className={classes.copy}>
              {plansTabContent[plan].typography}
            </Typography>
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
      title: plansTabContent[plan === 'standard' ? 'shared' : plan]?.title,
    };
  });

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  let selectedTypeClass: LinodeTypeClass = pathOr(
    'dedicated', // Use `dedicated` by default
    ['class'],
    types.find(
      (type) => type.id === selectedID || type.heading === currentPlanHeading
    )
  );

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  if (selectedTypeClass === 'nanode') {
    selectedTypeClass = 'standard';
  }

  const initialTab = tabOrder.indexOf(selectedTypeClass);

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

export default RenderGuard(SelectPlanPanel);
