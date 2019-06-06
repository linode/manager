import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'item';
const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  item: {
    padding: theme.spacing.unit
  }
});

interface Props {
  editing: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const StaticPoolsDisplay: React.FunctionComponent<
  CombinedProps
> = props => {
  const { editing } = props;
  return (
    <React.Fragment>Yo</React.Fragment>

  )
}


const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  React.memo,
  styled
);

export default enhanced(StaticPoolsDisplay);
