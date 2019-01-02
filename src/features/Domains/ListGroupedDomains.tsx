import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListGroupedDomains: React.StatelessComponent<CombinedProps> = (props) => {
  return (<h1>Grouped Domains</h1>);
};

const styled = withStyles(styles);

export default styled(ListGroupedDomains);
