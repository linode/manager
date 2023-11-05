import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Item } from 'src/components/EnhancedSelect';
import { Option } from 'src/components/EnhancedSelect/components/Option';

import type { OptionProps } from 'react-select';

const useStyles = makeStyles()((theme: Theme) => ({
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  root: {
    padding: theme.spacing(1),
  },
}));

interface EngineOptionProps extends OptionProps<any, any> {
  data: Item<string> & { flag: JSX.Element };
}

export const EngineOption = (props: EngineOptionProps) => {
  const { classes, cx } = useStyles();
  const { data, label } = props;

  return (
    <Option
      className={cx({
        [classes.focused]: props.isFocused,
        [classes.root]: true,
      })}
      attrs={{ ['data-qa-engine-select-item']: data.value }}
      value={data.value}
      {...props}
      data-testid={data.value}
    >
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
    </Option>
  );
};
