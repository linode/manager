import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {}

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectAppPanel: React.SFC<CombinedProps> = props => {
  return <div>hello world</div>;
};

const styled = withStyles(styles);

export default compose<CombinedProps, {}>(
  styled,
  React.memo
)(SelectAppPanel);
