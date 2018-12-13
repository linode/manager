import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  view: undefined | 'list' | 'grid';
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DisplayGroupedLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  return (<div>Grouped Linodes {props.view}</div>);
};

const styled = withStyles(styles);

export default styled(DisplayGroupedLinodes);
