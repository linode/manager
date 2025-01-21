import { Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useFlags } from 'src/hooks/useFlags';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';

import type { LinodeTypeClass } from '@linode/api-v4';
import type {
  PlanSelectionDividers,
  PlanSelectionFilterOptionsTable,
} from 'src/features/components/PlansPanel/PlanContainer';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

const tableCells = [
  { cellName: 'Plan', center: false, noWrap: false, testId: 'plan' },
  { cellName: 'Monthly', center: false, noWrap: false, testId: 'monthly' },
  { cellName: 'Hourly', center: false, noWrap: false, testId: 'hourly' },
  { cellName: 'RAM', center: true, noWrap: false, testId: 'ram' },
  { cellName: 'CPUs', center: true, noWrap: false, testId: 'cpu' },
  { cellName: 'Storage', center: true, noWrap: false, testId: 'storage' },
  { cellName: 'Quantity', center: false, noWrap: false, testId: 'quantity' },
];

export interface KubernetesPlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  getTypeCount: (planId: string) => number;
  hasMajorityOfPlansDisabled: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  planType?: LinodeTypeClass;
  plans: PlanWithAvailability[];
  selectedId?: string;
  selectedRegionId?: string;
  updatePlanCount: (planId: string, newCount: number) => void;
  wholePanelIsDisabled: boolean;
}

export const KubernetesPlanContainer = (
  props: KubernetesPlanContainerProps
) => {
  const {
    getTypeCount,
    hasMajorityOfPlansDisabled,
    onAdd,
    onSelect,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;
  const flags = useFlags();
  const shouldDisplayNoRegionSelectedMessage = !selectedRegionId;

  /**
   * This features allows us to divide the GPU plans into two separate tables.
   * This can be re-used for other plan types in the future.
   */
  const planSelectionDividers: PlanSelectionDividers[] = [
    {
      flag: Boolean(flags.gpuv2?.planDivider),
      planType: 'gpu',
      tables: [
        {
          header: 'NVIDIA RTX 4000 Ada',
          planFilter: (plan: PlanWithAvailability) =>
            plan.label.includes('Ada'),
        },
        {
          header: 'NVIDIA Quadro RTX 6000',
          planFilter: (plan: PlanWithAvailability) =>
            !plan.label.includes('Ada'),
        },
      ],
    },
  ];

  const renderPlanSelection = React.useCallback(
    (filterOptions?: PlanSelectionFilterOptionsTable) => {
      const _plans = filterOptions?.planFilter
        ? plans.filter(filterOptions.planFilter)
        : plans;

      return _plans.map((plan, id) => {
        return (
          <KubernetesPlanSelection
            getTypeCount={getTypeCount}
            hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
            idx={id}
            key={id}
            onAdd={onAdd}
            onSelect={onSelect}
            plan={plan}
            selectedId={selectedId}
            selectedRegionId={selectedRegionId}
            updatePlanCount={updatePlanCount}
            wholePanelIsDisabled={wholePanelIsDisabled}
          />
        );
      });
    },
    [
      wholePanelIsDisabled,
      hasMajorityOfPlansDisabled,
      getTypeCount,
      onAdd,
      onSelect,
      plans,
      selectedId,
      selectedRegionId,
      updatePlanCount,
    ]
  );

  return (
    <Grid container spacing={2}>
      <Hidden mdUp>
        {shouldDisplayNoRegionSelectedMessage ? (
          <Notice
            spacingLeft={8}
            spacingTop={8}
            sx={{ '& p': { fontSize: '0.875rem' } }}
            text={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
            variant="info"
          />
        ) : (
          planSelectionDividers.map((planSelectionDivider) =>
            planType === planSelectionDivider.planType &&
            planSelectionDivider.flag
              ? planSelectionDivider.tables.map((table) => {
                  const filteredPlans = table.planFilter
                    ? plans.filter(table.planFilter)
                    : plans;
                  return [
                    filteredPlans.length > 0 && (
                      <Grid key={table.header} xs={12}>
                        <Typography variant="h3">{table.header}</Typography>
                      </Grid>
                    ),
                    renderPlanSelection({
                      planFilter: table.planFilter,
                    }),
                  ];
                })
              : renderPlanSelection()
          )
        )}
      </Hidden>
      <Hidden mdDown>
        <Grid lg={12} xs={12}>
          <Table aria-label="List of Linode Plans" spacingBottom={16}>
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, center, noWrap, testId }) => {
                  const attributeValue = `${testId}-header`;
                  return (
                    <TableCell
                      center={center}
                      data-qa={attributeValue}
                      key={testId}
                      noWrap={noWrap}
                    >
                      {cellName === 'Quantity' ? (
                        <p className="visually-hidden">{cellName}</p>
                      ) : (
                        cellName
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="grid">
              {shouldDisplayNoRegionSelectedMessage ? (
                <TableRowEmpty
                  colSpan={9}
                  message={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
                />
              ) : (
                planSelectionDividers.map((planSelectionDivider) =>
                  planType === planSelectionDivider.planType &&
                  planSelectionDivider.flag
                    ? planSelectionDivider.tables.map((table) => {
                        const filteredPlans = table.planFilter
                          ? plans.filter(table.planFilter)
                          : plans;
                        return [
                          filteredPlans.length > 0 && (
                            <Grid key={table.header} xs={12}>
                              <Typography
                                data-qa={`${table.header} table-header`}
                                variant="h3"
                              >
                                {table.header}
                              </Typography>
                            </Grid>
                          ),
                          renderPlanSelection({
                            header: table.header,
                            planFilter: table.planFilter,
                          }),
                        ];
                      })
                    : renderPlanSelection()
                )
              )}
            </TableBody>
          </Table>
        </Grid>
      </Hidden>
    </Grid>
  );
};
