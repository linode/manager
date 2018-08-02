import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

export class SupportTicketDetail extends React.Component<CombinedProps,State> {
  render() {
    return (
      <div></div>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
)(SupportTicketDetail)