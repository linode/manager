import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Notice } from 'src/components/Notice/Notice';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';
import { PlanSelection } from './PlanSelection';

import type { TypeWithAvailability } from './types';
import type { Region } from '@linode/api-v4';

const tableCells = [
  { cellName: '', center: false, noWrap: false, testId: '' },
  { cellName: 'Plan', center: false, noWrap: false, testId: 'plan' },
  { cellName: 'Monthly', center: false, noWrap: false, testId: 'monthly' },
  { cellName: 'Hourly', center: false, noWrap: false, testId: 'hourly' },
  { cellName: 'RAM', center: true, noWrap: false, testId: 'ram' },
  { cellName: 'CPUs', center: true, noWrap: false, testId: 'cpu' },
  { cellName: 'Storage', center: true, noWrap: false, testId: 'storage' },
  { cellName: 'Transfer', center: true, noWrap: false, testId: 'transfer' },
  {
    cellName: 'Network In / Out',
    center: true,
    noWrap: true,
    testId: 'network',
  },
];

type AllDisabledPlans = TypeWithAvailability & {
  isDisabled512GbPlan: boolean;
  isLimitedAvailabilityPlan: boolean;
};

export interface Props {
  allDisabledPlans: AllDisabledPlans[];
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  disabledPlanTypesToolTipText?: string;
  hasMajorityOfPlansDisabled: boolean;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  plans: TypeWithAvailability[];
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showLimits?: boolean;
}

export const PlanContainer = (props: Props) => {
  const {
    allDisabledPlans,
    currentPlanHeading,
    disabled: isWholePanelDisabled,
    disabledClasses,
    disabledPlanTypesToolTipText,
    hasMajorityOfPlansDisabled,
    isCreate,
    linodeID,
    onSelect,
    plans,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showLimits,
  } = props;
  const location = useLocation();

  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const showTransfer =
    showLimits && plans.some((plan: TypeWithAvailability) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const showNetwork =
    showLimits && plans.some((plan: TypeWithAvailability) => plan.network_out);

  // DC Dynamic price logic - DB creation and DB resize flows are currently out of scope
  const isDatabaseCreateFlow = location.pathname.includes('/databases/create');
  const isDatabaseResizeFlow =
    location.pathname.match(/\/databases\/.*\/(\d+\/resize)/)?.[0] ===
    location.pathname;
  const shouldDisplayNoRegionSelectedMessage =
    !selectedRegionId && !isDatabaseCreateFlow && !isDatabaseResizeFlow;

  const renderPlanSelection = React.useCallback(() => {
    return plans.map((plan, id) => {
      const isPlanDisabled = allDisabledPlans.some(
        (disabledPlan) => disabledPlan.id === plan.id
      );
      const currentDisabledPlan = allDisabledPlans.find(
        (disabledPlan) => disabledPlan.id === plan.id
      );
      const currentDisabledPlanStatus = currentDisabledPlan && {
        isDisabled512GbPlan: currentDisabledPlan.isDisabled512GbPlan,
        isLimitedAvailabilityPlan:
          currentDisabledPlan.isLimitedAvailabilityPlan,
      };

      return (
        <PlanSelection
          hideDisabledHelpIcons={
            isWholePanelDisabled || hasMajorityOfPlansDisabled
          }
          currentPlanHeading={currentPlanHeading}
          disabledClasses={disabledClasses}
          disabledStatus={currentDisabledPlanStatus}
          disabledToolTip={disabledPlanTypesToolTipText}
          idx={id}
          isCreate={isCreate}
          key={id}
          linodeID={linodeID}
          onSelect={onSelect}
          planIsDisabled={isPlanDisabled}
          selectedDiskSize={selectedDiskSize}
          selectedId={selectedId}
          selectedRegionId={selectedRegionId}
          showNetwork={showNetwork}
          showTransfer={showTransfer}
          type={plan}
          wholePanelIsDisabled={isWholePanelDisabled}
        />
      );
    });
  }, [
    plans,
    allDisabledPlans,
    isWholePanelDisabled,
    hasMajorityOfPlansDisabled,
    currentPlanHeading,
    disabledClasses,
    disabledPlanTypesToolTipText,
    isCreate,
    linodeID,
    onSelect,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showNetwork,
    showTransfer,
  ]);

  return (
    <Grid container spacing={2}>
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
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
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          <StyledTable aria-label="List of Linode Plans" spacingBottom={16}>
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, center, noWrap, testId }) => {
                  const attributeValue = `${testId}-header`;
                  if (
                    (!showTransfer && testId === 'transfer') ||
                    (!showNetwork && testId === 'network')
                  ) {
                    return null;
                  }
                  return (
                    <StyledTableCell
                      center={center}
                      data-qa={attributeValue}
                      isPlanCell={cellName === 'Plan'}
                      key={testId}
                      noWrap={noWrap}
                    >
                      {cellName}
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="radiogroup">
              {shouldDisplayNoRegionSelectedMessage ? (
                <TableRowEmpty
                  colSpan={9}
                  message={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
                />
              ) : (
                renderPlanSelection()
              )}
            </TableBody>
          </StyledTable>
        </Grid>
      </Hidden>
    </Grid>
  );
};
