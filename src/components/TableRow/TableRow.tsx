import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import _TableRow, {
  TableRowProps as _TableRowProps
} from 'src/components/core/TableRow';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
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
        paddingLeft: 5
      }
    }
  }
});

type onClickFn = (e: React.ChangeEvent<HTMLTableRowElement>) => void;

interface Props {
  rowLink?: string | onClickFn;
  className?: string;
  staticContext?: boolean;
  htmlFor?: string;
}

type CombinedProps = Props &
  _TableRowProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

class TableRow extends React.Component<CombinedProps> {
  rowClick = (
    e: React.ChangeEvent<HTMLTableRowElement>,
    ev: React.MouseEvent<HTMLElement>, // added a second event for the purpose of capturing keyDown (open in new tab)
    target: string | onClickFn
  ) => {
    const body = document.body as any;
    // Inherit the ROW click unless the element is a <button> or an <a> or is contained within them
    const isButton =
      e.target.tagName === 'BUTTON' || e.target.closest('button');
    const isAnchor = e.target.tagName === 'A' || e.target.closest('a');

    if (
      body.getAttribute('style') === null ||
      body.getAttribute('style').indexOf('overflow: hidden') !== 0 ||
      body.getAttribute('style') === ''
    ) {
      if (!isButton && !isAnchor) {
        e.stopPropagation();
        // return if no modal is open
        if (typeof target === 'string') {
          !ev.metaKey && !ev.ctrlKey
            ? // if no meta or ctrl key is pressed (new tab)
              this.props.history.push(target)
            : // else open in new tab/window
              window.open(target, '_blank');
        }
        if (typeof target === 'function') {
          target(e);
        }
      }
    }
  };

  render() {
    const { classes, className, rowLink, staticContext, ...rest } = this.props;

    let role;
    switch (typeof rowLink) {
      case 'string':
        role = 'link';
        break;
      case 'function':
        role = 'button';
        break;
      default:
        role = undefined;
    }

    return (
      <_TableRow
        onClick={(e: any) => rowLink && this.rowClick(e, e, rowLink)} // same argument, different methods (one to stop propagation, one to add the listener for meta/ctrl key)
        onKeyUp={(e: any) =>
          rowLink && e.keyCode === 13 && this.rowClick(e, e, rowLink)
        }
        hover={rowLink !== undefined}
        role={role}
        className={classNames(className, {
          [classes.root]: true
        })}
        {...rest}
        tabIndex={rowLink ? 0 : -1}
      >
        {this.props.children}
      </_TableRow>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(withRouter(TableRow));
