import { Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { StyledAlertChip } from './AlertDetail';

export interface AlertDimensionsProp {
  /*
   * Controls whether we need to display the chips one by one or join and display
   */
  isJoin?: boolean;
  /*
   * The label under which the chips will be displayed
   */
  label: string;
  /*
   * Controls the size of the chip label from medium to larger screens
   */
  labelWidth?: number;
  /*
   * Controls the size of the chip value from medium to larger screens
   */
  valueWidth?: number;
  /*
   * The chips that needs to be displayed
   */
  values: Array<string> | Array<string[]>;
}

export const DisplayAlertChips = React.memo((props: AlertDimensionsProp) => {
  const {
    isJoin,
    label,
    labelWidth: mdLabel = 4,
    valueWidth: mdValue = 8,
    values: values,
  } = props;

  const iterables: string[][] =
    Array.isArray(values) && values.every(Array.isArray) ? values : [values];

  const theme = useTheme();

  /**
   * @param isJoin Whether to join the chips or not
   * @param index  The index of the list of chips that we are rendering
   * @param length The length of the iteration so far
   * @returns The border radius to be applied on chips based on the parameters
   */
  const getBorderRadius = (index: number, length: number) => {
    if (!isJoin || length === 1) {
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
    <Grid container data-qa-item={label} item spacing={1}>
      {iterables.map((value, idx) => (
        <React.Fragment key={idx}>
          <Grid item md={mdLabel} xs={12}>
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
          <Grid item md={mdValue} xs={12}>
            <Grid
              container
              flexWrap={isJoin ? 'nowrap' : 'wrap'}
              gap={isJoin ? 0 : 1}
            >
              {value.map((label, index) => (
                <Grid
                  item
                  key={index}
                  marginLeft={isJoin && index > 0 ? -1 : 0}
                  p={0}
                >
                  <StyledAlertChip
                    borderRadius={getBorderRadius(index, value.length)}
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
});
