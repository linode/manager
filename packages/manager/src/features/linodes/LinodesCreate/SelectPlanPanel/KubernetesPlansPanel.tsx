import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import TabbedPanel from 'src/components/TabbedPanel';
import { CreateNodePoolData } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';
import { getPlanSelectionsByPlanType } from 'src/utilities/filterPlanSelectionsByType';
import { RenderPlanContainer } from './RenderPlanContainerLKE';
import { PlanInformation } from './PlanInformation';
import { plansTabContent } from './planTabsContent';
import { useSelectPlanQuantityStyles } from './Styles/selectPlanQuantityStyles';
// import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';

interface Props {
  addPool?: (pool?: CreateNodePoolData) => void;
  copy?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  error?: string;
  getTypeCount: (planId: string) => number;
  header?: string;
  isSubmitting?: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  resetValues: () => void;
  selectedID?: string;
  types: ExtendedType[];
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlansPanel = ({
  copy,
  disabled,
  error,
  header,
  onAdd,
  updatePlanCount,
  types,
  resetValues,
  currentPlanHeading,
  getTypeCount,
  onSelect,
  selectedID,
}: Props) => {
  const { classes } = useSelectPlanQuantityStyles();

  const plans = getPlanSelectionsByPlanType(types);

  const tabOrder: LinodeTypeClass[] = Object.keys(plans).map((plan) =>
    plan === 'shared' ? 'standard' : (plan as LinodeTypeClass)
  );

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      render: () => {
        return (
          <>
            <PlanInformation planType={plan} />
            <RenderPlanContainer
              disabled={disabled}
              getTypeCount={getTypeCount}
              onAdd={onAdd}
              onSelect={onSelect}
              plans={plans[plan]}
              selectedID={selectedID}
              updatePlanCount={updatePlanCount}
            />
          </>
        );
      },
      title: plansTabContent[plan === 'standard' ? 'shared' : plan]?.title,
    };
  });

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  const _selectedTypeClass: LinodeTypeClass =
    types.find(
      (type) => type.id === selectedID || type.heading === currentPlanHeading
    )?.class ?? 'dedicated';

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  const selectedTypeClass: LinodeTypeClass =
    _selectedTypeClass === 'nanode' ? 'standard' : _selectedTypeClass;

  const initialTab = tabOrder.indexOf(selectedTypeClass);

  return (
    <TabbedPanel
      copy={copy}
      error={error}
      handleTabChange={() => resetValues()}
      header={header || ' '}
      initTab={initialTab >= 0 ? initialTab : 0}
      rootClass={classes.root}
      tabs={tabs}
    />
  );
};

export default KubernetesPlansPanel;
