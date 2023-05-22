import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { isEmpty } from 'ramda';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { gpuPlanText } from './utilities';
import { CreateNodePoolData } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';
import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';
import { getPlanSelectionsByPlanType } from 'src/utilities/filterPlanSelectionsByType';
import { RenderSelectionLKE } from './SelectPlanPanel/RenderSelectionLKE';
import { useSelectPlanQuantityStyles } from './SelectPlanPanel/Styles/selectPlanQuantityStyles';

interface Props {
  types: ExtendedType[];
  getTypeCount: (planId: string) => number;
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  onAdd?: (key: string, value: number) => void;
  addPool?: (pool?: CreateNodePoolData) => void;
  updatePlanCount: (planId: string, newCount: number) => void;
  isSubmitting?: boolean;
  resetValues: () => void;
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
  onSelect: handleOnSelect,
  selectedID,
}: Props) => {
  const { classes } = useSelectPlanQuantityStyles();

  const onSelect = (id: string) => () => handleOnSelect(id);

  const renderPlanContainer = (plans: ExtendedType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow>
          <TableCell data-qa-plan-header>Plan</TableCell>
          <TableCell data-qa-monthly-header>Monthly</TableCell>
          <TableCell data-qa-hourly-header>Hourly</TableCell>
          <TableCell center data-qa-ram-header>
            RAM
          </TableCell>
          <TableCell center data-qa-cpu-header>
            CPUs
          </TableCell>
          <TableCell center data-qa-storage-header>
            Storage
          </TableCell>
          <TableCell>
            <p className="visually-hidden">Quantity</p>
          </TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container spacing={2}>
        <Hidden mdUp>
          {plans.map((plan, id) => (
            <RenderSelectionLKE
              disabled={disabled}
              getTypeCount={getTypeCount}
              idx={id}
              key={id}
              onAdd={onAdd}
              onSelect={onSelect}
              selectedID={selectedID}
              type={plan}
              updatePlanCount={updatePlanCount}
            />
          ))}
        </Hidden>
        <Hidden mdDown>
          <Grid xs={12} lg={12}>
            <Table aria-label="List of Linode Plans" spacingBottom={16}>
              {tableHeader}
              <TableBody role="grid">
                {plans.map((plan, id) => (
                  <RenderSelectionLKE
                    disabled={disabled}
                    getTypeCount={getTypeCount}
                    idx={id}
                    key={id}
                    onAdd={onAdd}
                    onSelect={onSelect}
                    selectedID={selectedID}
                    type={plan}
                    updatePlanCount={updatePlanCount}
                  />
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

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
              {renderPlanContainer(dedicated)}
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
              {renderPlanContainer(shared)}
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
              {renderPlanContainer(highmem)}
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
              {renderPlanContainer(gpu)}
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
              {renderPlanContainer(premium)}
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
      rootClass={`${classes.root} tabbedPanel`}
      error={error}
      header={header || ' '}
      copy={copy}
      tabs={tabs}
      initTab={initialTab >= 0 ? initialTab : 0}
      handleTabChange={() => resetValues()}
    />
  );
};

export default SelectPlanQuantityPanel;
