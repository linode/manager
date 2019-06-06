import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

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
  const { pools, types } = props;
  return (
    <React.Fragment>Yo</React.Fragment>

  )
}


const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled
);

export default enhanced(EditablePoolsDisplay);
