import { Notice } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';

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
    plans,
    selectedId,
    selectedRegionId,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;

  const shouldDisplayNoRegionSelectedMessage = !selectedRegionId;

  const renderPlanSelection = React.useCallback(() => {
    return plans.map((plan, id) => {
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
  }, [
    wholePanelIsDisabled,
    hasMajorityOfPlansDisabled,
    getTypeCount,
    onAdd,
    onSelect,
    plans,
    selectedId,
    selectedRegionId,
    updatePlanCount,
  ]);

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
          renderPlanSelection()
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
                renderPlanSelection()
              )}
            </TableBody>
          </Table>
        </Grid>
      </Hidden>
    </Grid>
  );
};
