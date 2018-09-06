import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow, { TableRowProps } from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    borderLeft: '5px solid transparent',
    '& > td:first-child, & > th:first-child': {
      paddingLeft: 13,
    },
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

type onClickFn = (e: React.MouseEvent<HTMLElement>) => void;

interface Props {
  rowLink?: string | onClickFn;
  className?: string;
  staticContext?: boolean;
  htmlFor?: string;
}

type CombinedProps = Props & TableRowProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

class WrappedTableRow extends React.Component<CombinedProps> {

  rowClick = (e: any, target: string | onClickFn ) =>  {
    if (e.target.tagName === 'TD') {
      e.stopPropagation();
      if (typeof(target) === 'string') {
        this.props.history.push(target);
      }
    }
    if (typeof(target) === 'function') { target(e) };
  }

  render() {
    const { classes, className, rowLink, staticContext, ...rest } = this.props;

    return (
        <TableRow
          onClick={(e) => rowLink && this.rowClick(e, rowLink)}
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