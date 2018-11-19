import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import _TableRow, { TableRowProps as _TableRowProps } from 'src/components/core/TableRow';

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
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['background-color']),
        paddingLeft: 5,
      },
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

type CombinedProps = Props & _TableRowProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

class TableRow extends React.Component<CombinedProps> {

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
        <_TableRow
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
        </_TableRow>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(withRouter(TableRow));
