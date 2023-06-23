import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { OptionProps } from 'react-select';
import Tooltip from 'src/components/core/Tooltip';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  disabled: {
    cursor: 'not-allowed !important',
  },
}));

export interface RegionItem extends Item<string> {
  flag: JSX.Element | null;
  country: string;
  disabledMessage?: string | JSX.Element;
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
        [classes.root]: true,
        [classes.focused]: props.isFocused,
        [classes.disabled]: isDisabled,
      })}
      value={data.value}
      attrs={{ ['data-qa-region-select-item']: data.value }}
      {...props}
      data-testid={data.value}
    >
      {isDisabled ? (
        <Tooltip
          title={data.disabledMessage ?? ''}
          enterTouchDelay={500}
          enterDelay={500}
        >
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={2}
          >
            <Grid className="py0">{data.flag}</Grid>
            <Grid>{label} (Not available)</Grid>
          </Grid>
        </Tooltip>
      ) : (
        <Grid
          container
          direction="row"
          alignItems="center"
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
