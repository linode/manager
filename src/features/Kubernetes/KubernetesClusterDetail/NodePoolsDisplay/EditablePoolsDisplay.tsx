import * as React from 'react';
import { compose } from 'recompose';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import { ExtendedPoolNode } from '../../types';

type ClassNames = 'root' | 'item';
const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  item: {
    padding: theme.spacing.unit
  }
});

interface Props {
  pools: ExtendedPoolNode[];
  types: Linode.LinodeType[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const EditablePoolsDisplay: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes } = props;
  return <div className={classes.root}>Pools display</div>;
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled
);

export default enhanced(EditablePoolsDisplay);
