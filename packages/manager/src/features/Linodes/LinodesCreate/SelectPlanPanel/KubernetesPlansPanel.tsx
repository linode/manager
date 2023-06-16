import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { makeStyles } from 'tss-react/mui';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { CreateNodePoolData } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';
import { KubernetesPlanContainer } from './KubernetesPlanContainer';
import { PlanInformation } from './PlanInformation';
import {
  determineInitialPlanCategoryTab,
  getPlanSelectionsByPlanType,
  planTabInfoContent,
} from './utils';

const useStyles = makeStyles()(() => ({
  root: {
    padding: 0,
  },
}));

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
  const { classes, cx } = useStyles();

  const plans = getPlanSelectionsByPlanType(types);

  const tabs = Object.keys(plans).map((plan: LinodeTypeClass) => {
    return {
      render: () => {
        return (
          <>
            <PlanInformation planType={plan} />
            <KubernetesPlanContainer
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
      rootClass={cx(classes.root)}
      copy={copy}
      error={error}
      handleTabChange={() => resetValues()}
      header={header || ' '}
      initTab={initialTab >= 0 ? initialTab : 0}
      tabs={tabs}
    />
  );
};

export default KubernetesPlansPanel;
