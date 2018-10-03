import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow, { TableRowProps } from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    transition: theme.transitions.create(['background-color']),
    [theme.breakpoints.up('md')]: {
      '&:before': {
        content: "''",
        display: 'table-cell',
        width: '0.01%',
        height: '100%',
        borderLeftWidth: 5,
        borderLeftStyle: 'solid',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['border-color']),
      },
    },
    '& > td:first-child, & > th:first-child': {
      paddingLeft: 13,
    },
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