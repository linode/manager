import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
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
  flag: () => JSX.Element | null;
  country: string;
  disabledMessage?: string | JSX.Element;
}
interface RegionOptionProps extends OptionProps<any> {
  data: RegionItem;
}

type CombinedProps = RegionOptionProps;

export const RegionOption: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { data, label } = props;
  const isDisabled = Boolean(data.disabledMessage);
  return (
    <Option
      className={classNames({
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
          interactive
        >
          <Grid
            container
            direction="row"
            alignItems="center"
            justify="flex-start"
          >
            <Grid item className="py0">
              {data.flag && data.flag()}
            </Grid>
            <Grid item>{label} (Not available)</Grid>
          </Grid>
        </Tooltip>
      ) : (
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="flex-start"
        >
          <Grid item className="py0">
            {data.flag && data.flag()}
          </Grid>
          <Grid item>{label}</Grid>
        </Grid>
      )}
    </Option>
  );
};

export default RegionOption;
