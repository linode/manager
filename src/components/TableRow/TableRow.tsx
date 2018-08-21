import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow, { TableRowProps } from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
});

interface Props {
  goTo?: string;
}

type CombinedProps = Props & TableRowProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

class WrappedTableRow extends React.Component<CombinedProps> {

  goTo = (path: string) =>  {
    this.props.history.push(path);
  }

  render() {
    const { classes, className, ...rest } = this.props;

    return (
        <TableRow
          className={classNames(
          className,
            {
              [classes.root]: true,
            })}
          {...rest
        }>
          {this.props.children}
        </TableRow>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  withRouter
)(WrappedTableRow);
