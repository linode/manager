import { BetaChip } from '@linode/ui';
import { GridLegacy, useTheme } from '@mui/material';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import { StyledAlertTypography } from './AlertDetail';

import type { Status } from 'src/components/StatusIcon/StatusIcon';

interface AlertDetailRowProps {
  /**
   * The label or title of the row
   */
  label: string;
  /**
   * Number of grid columns for the label on small and larger screens.
   * Defaults to 4. This controls the width of the label in the grid layout.
   */
  labelGridColumns?: number;

  /**
   * Whether to show a beta chip next to the value.
   * Defaults to false. If true, a beta chip will be displayed.
   */
  showBetaChip?: boolean;
  /**
   * The status icon to be displayed in the row. It can represent states like "active", "inactive", etc.
   * Pass a valid status (e.g., 'active', 'inactive') to display the appropriate status icon.
   */
  status?: Status;
  /**
   * The value of the row
   */
  value: null | string;
  /**
   * Number of grid columns for the value on medium and larger screens.
   * Defaults to 8. This controls the width of the value in the grid layout.
   */
  valueGridColumns?: number;
}

export const AlertDetailRow = React.memo((props: AlertDetailRowProps) => {
  const {
    label,
    labelGridColumns = 4,
    status,
    value,
    valueGridColumns = 8,
    showBetaChip,
  } = props;

  const theme = useTheme();

  return (
    <GridLegacy container data-qa-item={label} item xs={12}>
      <GridLegacy item sm={labelGridColumns} xs={12}>
        <StyledAlertTypography sx={{ font: theme.font.bold }}>
          {label}:
        </StyledAlertTypography>
      </GridLegacy>
      <GridLegacy container item sm={valueGridColumns} xs={12}>
        {status && (
          <StatusIcon
            marginTop={theme.spacing(0.7)}
            maxHeight={theme.spacing(1)}
            maxWidth={theme.spacing(1)}
            status={status}
          />
        )}
        <StyledAlertTypography>
          {value} {showBetaChip && <BetaChip />}
        </StyledAlertTypography>
      </GridLegacy>
    </GridLegacy>
  );
});
