import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { OptionProps } from 'react-select';
import { makeStyles } from 'tss-react/mui';

import { Item } from 'src/components/EnhancedSelect';
import { Option } from 'src/components/EnhancedSelect/components/Option';
import { Tooltip } from 'src/components/Tooltip';

const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    cursor: 'not-allowed !important',
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  root: {
    padding: theme.spacing(1),
  },
}));

export interface RegionItem extends Item<string> {
  country: string;
  disabledMessage?: JSX.Element | string;
  flag: JSX.Element | null;
}
interface RegionOptionProps extends OptionProps<any, any> {
  data: RegionItem;
}

export const RegionOption = (props: RegionOptionProps) => {
  const { classes, cx } = useStyles();
  const { data, label } = props;
  const isDisabled = Boolean(data.disabledMessage);
  return (
    <Option
      className={cx({
        [classes.disabled]: isDisabled,
        [classes.focused]: props.isFocused,
        [classes.root]: true,
      })}
      attrs={{ ['data-qa-region-select-item']: data.value }}
      value={data.value}
      {...props}
      data-testid={data.value}
    >
      {isDisabled ? (
        <Tooltip
          enterDelay={500}
          enterTouchDelay={500}
          title={data.disabledMessage ?? ''}
        >
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="flex-start"
            spacing={2}
          >
            <Grid className="py0">{data.flag}</Grid>
            <Grid>{label} (Not available)</Grid>
          </Grid>
        </Tooltip>
      ) : (
        <Grid
          alignItems="center"
          container
          direction="row"
          justifyContent="flex-start"
          spacing={2}
        >
          <Grid className="py0">{data.flag}</Grid>
          <Grid>{label}</Grid>
        </Grid>
      )}
    </Option>
  );
};
