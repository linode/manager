import { PriceObject } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { LIMITED_AVAILABILITY_COPY } from 'src/features/components/PlansPanel/constants';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import type { TypeWithAvailability } from 'src/features/components/PlansPanel/types';

export interface KubernetesPlanSelectionProps {
  getTypeCount: (planId: string) => number;
  hasMajorityOfPlansDisabled: boolean;
  idx: number;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  plan: TypeWithAvailability;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  updatePlanCount: (planId: string, newCount: number) => void;
  wholePanelIsDisabled: boolean;
}

export const KubernetesPlanSelection = (
  props: KubernetesPlanSelectionProps
) => {
  const {
    getTypeCount,
    hasMajorityOfPlansDisabled,
    idx,
    onAdd,
    onSelect,
    plan,
    selectedId,
    selectedRegionId,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;

  const isRowDisabled =
    wholePanelIsDisabled || plan.planHasLimitedAvailability || plan.planIs512Gb;
  const count = getTypeCount(plan.id);
  const price: PriceObject | undefined = getLinodeRegionPrice(
    plan,
    selectedRegionId
  );

  // We don't want flat-rate pricing or network information for LKE so we select only the second type element.
  const subHeadings = [
    `$${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}/mo ($${
      price?.hourly
    }/hr)`,
    plan.subHeadings[1],
  ];

  const renderVariant = () => (
    <Grid xs={12}>
      <StyledInputOuter>
        <EnhancedNumberInput
          disabled={isRowDisabled}
          setValue={(newCount: number) => updatePlanCount(plan.id, newCount)}
          value={count}
        />
        {onAdd && (
          <Button
            buttonType="primary"
            disabled={count < 1 || isRowDisabled}
            onClick={() => onAdd(plan.id, count)}
            sx={{ marginLeft: '10px', minWidth: '85px' }}
          >
            Add
          </Button>
        )}
      </StyledInputOuter>
    </Grid>
  );
  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden mdDown>
        <TableRow
          data-qa-plan-row={plan.formattedLabel}
          disabled={isRowDisabled}
          key={plan.id}
        >
          <TableCell data-qa-plan-name>
            <Box alignItems="center">
              {plan.heading} &nbsp;
              {isRowDisabled &&
                !wholePanelIsDisabled &&
                !hasMajorityOfPlansDisabled &&
                (plan.planIs512Gb || plan.planHasLimitedAvailability) && (
                  <Tooltip
                    PopperProps={{
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          minWidth: 225,
                        },
                      },
                    }}
                    sx={{
                      alignItems: 'center',
                    }}
                    data-qa-tooltip={LIMITED_AVAILABILITY_COPY}
                    data-testid="disabled-plan-tooltip"
                    placement="right-start"
                    title={LIMITED_AVAILABILITY_COPY}
                  >
                    <IconButton disableRipple size="small">
                      <HelpOutline
                        sx={{
                          height: 18,
                          position: 'relative',
                          top: -2,
                          width: 18,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
            </Box>
          </TableCell>
          <TableCell
            data-qa-monthly
            errorCell={typeof price?.monthly !== 'number'}
            errorText={!price?.monthly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            ${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}
          </TableCell>
          <TableCell
            data-qa-hourly
            errorCell={typeof price?.hourly !== 'number'}
            errorText={!price?.hourly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            ${price?.hourly ?? UNKNOWN_PRICE}
          </TableCell>
          <TableCell center data-qa-ram>
            {convertMegabytesTo(plan.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {plan.vcpus}
          </TableCell>
          <TableCell center data-qa-storage>
            {convertMegabytesTo(plan.disk, true)}
          </TableCell>
          <TableCell>
            <StyledInputOuter>
              <EnhancedNumberInput
                disabled={
                  // When on the add pool flow, we only want the current input to be active,
                  // unless we've just landed on the form, all the inputs are empty,
                  // or there was a pricing data error.
                  (!onAdd && Boolean(selectedId) && plan.id !== selectedId) ||
                  isRowDisabled ||
                  typeof price?.hourly !== 'number'
                }
                setValue={(newCount: number) =>
                  updatePlanCount(plan.id, newCount)
                }
                inputLabel={`edit-quantity-${plan.id}`}
                value={count}
              />
              {onAdd && (
                <Button
                  disabled={
                    count < 1 ||
                    isRowDisabled ||
                    typeof price?.hourly !== 'number'
                  }
                  buttonType="primary"
                  onClick={() => onAdd(plan.id, count)}
                  sx={{ marginLeft: '10px', minWidth: '85px' }}
                >
                  Add
                </Button>
              )}
            </StyledInputOuter>
          </TableCell>
        </TableRow>
      </Hidden>
      {/* Displays SelectionCard for small screens */}
      <Hidden mdUp>
        <SelectionCard
          subheadings={[
            ...subHeadings,
            isRowDisabled ? (
              <Chip label="Limited Deployment Availability" />
            ) : (
              ''
            ),
          ]}
          checked={plan.id === String(selectedId)}
          disabled={isRowDisabled}
          heading={plan.heading}
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          renderVariant={renderVariant}
          tooltip={isRowDisabled ? LIMITED_AVAILABILITY_COPY : undefined}
        />
      </Hidden>
    </React.Fragment>
  );
};

const StyledInputOuter = styled('div', { label: 'StyledInputOuter' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  })
);
