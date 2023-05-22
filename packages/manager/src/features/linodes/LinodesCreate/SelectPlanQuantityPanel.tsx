import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { isEmpty } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import { gpuPlanText } from './utilities';
import { CreateNodePoolData } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';
import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';
import { getPlanSelectionsByPlanType } from 'src/utilities/filterPlanSelectionsByType';
import { RenderPlanContainer } from './SelectPlanPanel/RenderPlanContainerLKE';
import { useSelectPlanQuantityStyles } from './SelectPlanPanel/Styles/selectPlanQuantityStyles';

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

export const SelectPlanQuantityPanel = ({
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

  const createTabs = (): [Tab[], LinodeTypeClass[]] => {
    const tabs: Tab[] = [];
    const {
      nanode,
      standard,
      highmem,
      dedicated,
      gpu,
      premium,
    } = getPlanSelectionsByPlanType(types);

    const tabOrder: LinodeTypeClass[] = [];

    const shared = [...nanode, ...standard];

    if (!isEmpty(dedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              {onAdd && (
                <Typography data-qa-dedicated className={classes.copy}>
                  Dedicated CPU instances are good for full-duty workloads where
                  consistent performance is important.
                </Typography>
              )}
              <RenderPlanContainer
                disabled={disabled}
                getTypeCount={getTypeCount}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={dedicated}
                selectedID={selectedID}
                updatePlanCount={updatePlanCount}
              />
            </>
          );
        },
        title: 'Dedicated CPU',
      });
      tabOrder.push('dedicated');
    }

    if (!isEmpty(shared)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography data-qa-standard className={classes.copy}>
                Shared CPU instances are good for medium-duty workloads and are
                a good mix of performance, resources, and price.
              </Typography>
              <RenderPlanContainer
                disabled={disabled}
                getTypeCount={getTypeCount}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={shared}
                selectedID={selectedID}
                updatePlanCount={updatePlanCount}
              />
            </>
          );
        },
        title: 'Shared CPU',
      });
      tabOrder.push('standard');
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        render: () => {
          return (
            <>
              {onAdd && (
                <Typography data-qa-highmem className={classes.copy}>
                  High Memory instances favor RAM over other resources, and can
                  be good for memory hungry use cases like caching and in-memory
                  databases. All High Memory plans use dedicated CPU cores.
                </Typography>
              )}
              <RenderPlanContainer
                disabled={disabled}
                getTypeCount={getTypeCount}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={highmem}
                selectedID={selectedID}
                updatePlanCount={updatePlanCount}
              />
            </>
          );
        },
        title: 'High Memory',
      });
      tabOrder.push('highmem');
    }

    if (!isEmpty(gpu)) {
      const programInfo = gpuPlanText(true);
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning>{programInfo}</Notice>
              {onAdd && (
                <Typography data-qa-gpu className={classes.copy}>
                  Linodes with dedicated GPUs accelerate highly specialized
                  applications such as machine learning, AI, and video
                  transcoding.
                </Typography>
              )}
              <RenderPlanContainer
                disabled={disabled}
                getTypeCount={getTypeCount}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={gpu}
                selectedID={selectedID}
                updatePlanCount={updatePlanCount}
              />
            </>
          );
        },
        title: 'GPU',
      });
      tabOrder.push('gpu');
    }

    if (!isEmpty(premium)) {
      tabs.push({
        render: () => {
          return (
            <>
              <PremiumPlansAvailabilityNotice />
              <Typography data-qa-gpu className={classes.copy}>
                Premium CPU instances guarantee a minimum processor model, AMD
                Epyc<sup>TM</sup> 7713 or higher, to ensure consistent high
                performance for more demanding workloads.
              </Typography>
              <RenderPlanContainer
                disabled={disabled}
                getTypeCount={getTypeCount}
                onAdd={onAdd}
                onSelect={onSelect}
                plans={premium}
                selectedID={selectedID}
                updatePlanCount={updatePlanCount}
              />
            </>
          );
        },
        title: 'Premium',
      });
      tabOrder.push('premium');
    }

    return [tabs, tabOrder];
  };

  const [tabs, tabOrder] = createTabs();

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
      rootClass={`${classes.root} tabbedPanel`}
      tabs={tabs}
    />
  );
};

export default SelectPlanQuantityPanel;
