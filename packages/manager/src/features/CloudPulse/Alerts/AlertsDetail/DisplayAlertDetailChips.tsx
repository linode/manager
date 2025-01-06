import { Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

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

    const iterables: string[][] = Array.isArray(values)
      ? values.every(Array.isArray)
        ? values
        : [values]
      : [];

    const theme = useTheme();

    /**
     * @param index  The index of the list of chips that we are rendering
     * @param length The length of the iteration so far
     * @returns The border radius to be applied on chips based on the parameters
     */
    const getAlertChipBorderRadius = (
      index: number,
      length: number
    ): string => {
      if (!mergeChips || length === 1) {
        return theme.spacing(0.3);
      }
      if (index === 0) {
        return `${theme.spacing(0.3)} 0 0 ${theme.spacing(0.3)}`;
      }
      if (index === length - 1) {
        return `0 ${theme.spacing(0.3)} ${theme.spacing(0.3)} 0`;
      }
      return '0';
    };

    return (
      <Grid container item spacing={1}>
        {iterables.map((value, idx) => (
          <React.Fragment key={idx}>
            <Grid item md={labelGridColumns} xs={12}>
              {idx === 0 && (
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
                        value.length
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
