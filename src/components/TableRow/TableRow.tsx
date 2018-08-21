import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow, { TableRowProps } from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
});

interface Props {
  goToLink?: string;
  className?: string;
}

type CombinedProps = Props & TableRowProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

class WrappedTableRow extends React.Component<CombinedProps> {

  goTo = (path: string) =>  {
    this.props.history.push(path);
  }

  render() {
    const { classes, className, goToLink, ...rest } = this.props;

    return (
        <TableRow
          onClick={() => goToLink && this.goTo(goToLink)}
          className={classNames(
          className,
            {
              [classes.root]: true,
            })}
          {...rest}
        >
          {this.props.children}
        </TableRow>
    );
  }
}

const styled = withStyles<ClassNames>(styles, { withTheme: true });
const styledTableRow = styled<CombinedProps>(WrappedTableRow);
const routedStyledTableRow = withRouter(styledTableRow);

export default routedStyledTableRow;