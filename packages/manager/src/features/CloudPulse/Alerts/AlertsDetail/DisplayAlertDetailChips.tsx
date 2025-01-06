import { Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { getAlertChipBorderRadius } from '../Utils/utils';
import { StyledAlertChip } from './AlertDetail';

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
      <Grid container item spacing={1}>
        {chipValues.map((value, index) => (
          <React.Fragment key={`${label}_${index}`}>
            <Grid item md={labelGridColumns} xs={12}>
              {index === 0 && (
                <Typography
                  color={theme.tokens.content.Text.Primary.Default}
                  fontFamily={theme.font.bold}
                  variant="body1"
                >
                  {label}:
                </Typography>
              )}
            </Grid>
            <Grid item md={valueGridColumns} xs={12}>
              <Grid
                container
                flexWrap={mergeChips ? 'nowrap' : 'wrap'}
                gap={mergeChips ? 0 : 1}
              >
                {value.map((label, index) => (
                  <Grid
                    item
                    key={index}
                    marginLeft={mergeChips && index > 0 ? -1 : 0}
                  >
                    <StyledAlertChip
                      borderRadius={getAlertChipBorderRadius(
                        index,
                        value.length,
                        mergeChips,
                        theme
                      )}
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
