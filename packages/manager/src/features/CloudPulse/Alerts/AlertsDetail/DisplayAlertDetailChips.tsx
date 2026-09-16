import { Box, GridLegacy, useTheme } from '@mui/material';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import { getAlertChipBorderRadius } from '../Utils/utils';
import { StyledAlertChip, StyledAlertTypography } from './AlertDetail';

export interface AlertDimensionsProp {
  copyable?: boolean;
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
  truncate?: boolean;
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
      copyable,
      label,
      labelGridColumns = 4,
      mergeChips,
      truncate,
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
      <GridLegacy container data-qa-item={label} item spacing={1}>
        {chipValues.map((value, index) => (
          <React.Fragment key={`${label}_${index}`}>
            <GridLegacy item md={labelGridColumns} xs={12}>
              {index === 0 && (
                <StyledAlertTypography sx={{ font: theme.font.bold }}>
                  {label}:
                </StyledAlertTypography>
              )}
            </GridLegacy>
            <GridLegacy item md={valueGridColumns} xs={12}>
              <GridLegacy
                container
                sx={{
                  flexWrap: mergeChips ? 'nowrap' : 'wrap',
                  gap: mergeChips ? 0 : 1,
                }}
              >
                {value.map((label, index) => (
                  <GridLegacy
                    item
                    key={index}
                    sx={truncate ? { minWidth: 0, width: '100%' } : undefined}
                  >
                    <Box
                      alignItems="center"
                      display="flex"
                      gap={copyable ? 1 : 0}
                      marginLeft={mergeChips && index > 0 ? -1 : 0}
                      minWidth={0}
                      width={truncate ? '100%' : undefined}
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
                        sx={{
                          flex: truncate ? 1 : undefined,
                          height: '16px',
                          minWidth: 0,
                          ...(truncate && {
                            overflow: 'hidden',
                            '& .MuiChip-label': {
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            },
                          }),
                        }}
                        variant="outlined"
                      />
                      {copyable && <CopyTooltip text={label} />}
                    </Box>
                  </GridLegacy>
                ))}
              </GridLegacy>
            </GridLegacy>
          </React.Fragment>
        ))}
      </GridLegacy>
    );
  }
);
