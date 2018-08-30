import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow, { TableRowProps } from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    transition: theme.transitions.create(['background-color', 'border-left-color']),
    '& .secondaryLink': {
      transition: theme.transitions.create('color'),
      '&:hover': {
        textDecoration: 'underline',
      }
    },
    '&:hover .secondaryLink': {
      color: theme.palette.primary.main,
    },
  },
});

interface Props {
  rowLink?: string;
  className?: string;
  staticContext?: boolean;
}

type CombinedProps = Props & TableRowProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

class WrappedTableRow extends React.Component<CombinedProps> {

  goTo = (e: any, path: string) =>  {
    if (e.target.tagName === 'TD') {
      e.stopPropagation();
      this.props.history.push(path);
    }
  }

  render() {
    const { classes, className, rowLink, staticContext, ...rest } = this.props;

    return (
        <TableRow
          onClick={(e) => rowLink && this.goTo(e, rowLink)}
          hover={rowLink !== undefined}
          role={rowLink && 'link'}
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