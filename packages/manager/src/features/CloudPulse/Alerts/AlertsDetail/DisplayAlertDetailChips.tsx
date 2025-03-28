import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { getAlertChipBorderRadius } from '../Utils/utils';
import { StyledAlertChip, StyledAlertTypography } from './AlertDetail';

export interface AlertDimensionsProp {
  /**
   * The label or title of the chips
   */
  label: string;
  /**
   * Number of grid columns for the label on medium to larger screens.
   * Defaults to 4. This controls the width of the label in the grid layout.
   */
  labelGridColumns?: number;
  /**
   * Determines whether chips should be displayed individually
   * or merged into a single row
   */
  mergeChips?: boolean;
  /**
   * Number of grid columns for the value on medium to larger screens.
   * Defaults to 8. This controls the width of the value in the grid layout.
   */
  valueGridColumns?: number;
  /**
   * The list of chip labels to be displayed.
   * Can be a flat array of strings or a nested array for grouped chips.
   * Example: ['chip1', 'chip2'] or [['group1-chip1', 'group1-chip2'], ['group2-chip1']]
   */
  values: Array<string> | Array<string[]>;
}

export const DisplayAlertDetailChips = React.memo(
  (props: AlertDimensionsProp) => {
    const {
      label,
      labelGridColumns = 4,
      mergeChips,
      valueGridColumns = 8,
      values: values,
    } = props;

    const chipValues: string[][] = Array.isArray(values)
      ? values.every(Array.isArray)
        ? values
        : [values]
      : [];
    const theme = useTheme();
    return (
      <Grid container data-qa-item={label} spacing={1}>
        {chipValues.map((value, index) => (
          <React.Fragment key={`${label}_${index}`}>
            <Grid size={{ md: labelGridColumns, xs: 12 }}>
              {index === 0 && (
                <StyledAlertTypography sx={{ font: theme.font.bold }}>
                  {label}:
                </StyledAlertTypography>
              )}
            </Grid>
            <Grid size={{ md: valueGridColumns, xs: 12 }}>
              <Grid
                sx={{
                  flexWrap: mergeChips ? 'nowrap' : 'wrap',
                  gap: mergeChips ? 0 : 1,
                }}
                container
              >
                {value.map((label, index) => (
                  <Grid
                    sx={{
                      marginLeft: mergeChips && index > 0 ? -1 : 0,
                    }}
                    key={index}
                  >
                    <StyledAlertChip
                      borderRadius={getAlertChipBorderRadius({
                        borderRadiusPxValue: theme.spacing(0.3),
                        index,
                        length: value.length,
                        mergeChips,
                      })}
                      data-qa-chip={label}
                      label={label}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    );
  }
);
