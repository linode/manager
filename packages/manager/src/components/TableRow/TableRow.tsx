import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import _TableRow, {
  TableRowProps as _TableRowProps
} from 'src/components/core/TableRow';

import { COMPACT_SPACING_UNIT } from 'src/themeFactory';

import ActiveCaret from 'src/assets/icons/activeRowCaret.svg';

type ClassNames = 'root' | 'selected' | 'withForcedIndex' | 'activeCaret';

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
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['background-color']),
          paddingLeft: 5
        }
      }
    },
    withForcedIndex: {
      '& td': {
        transition: theme.transitions.create(['color'])
      },
      transition: theme.transitions.create(['border-color']),
      '&:before': {
        borderLeft: `1px solid transparent`,
        paddingLeft: 4
      },
      '&:hover': {
        cursor: 'pointer',
        '& td': {
          color: theme.palette.primary.light
        }
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue
      }
    },
    selected: {
      backgroundColor: theme.bg.lightBlue,
      transform: 'scale(1)',
      '&:before': {
        transition: 'none',
        backgroundColor: theme.bg.lightBlue,
        borderColor: theme.palette.primary.light,
        borderRight: 0
      },
      '& td': {
        borderTopColor: theme.palette.primary.light,
        borderBottomColor: theme.palette.primary.light
      }
    },
    activeCaret: {
      color: theme.bg.lightBlue,
      position: 'absolute',
      top: 0,
      right: theme.spacing() === COMPACT_SPACING_UNIT ? -12 : -14,
      transform: 'translate(-.5px, -.5px)',
      height: theme.spacing() === COMPACT_SPACING_UNIT ? 34 : 42
    }
  });

type onClickFn = (e: React.ChangeEvent<HTMLTableRowElement>) => void;

interface Props {
  rowLink?: string | onClickFn;
  onClick?: onClickFn;
  onKeyUp?: any;
  className?: string;
  staticContext?: boolean;
  htmlFor?: string;
  selected?: boolean;
  forceIndex?: boolean;
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
              window.open(target, '_blank', 'noopener');
        }
        if (typeof target === 'function') {
          target(e);
        }
      }
    }
  };

  render() {
    const {
      classes,
      className,
      rowLink,
      staticContext,
      selected,
      forceIndex,
      ...rest
    } = this.props;

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
          [classes.root]: true,
          [classes.selected]: selected,
          [classes.withForcedIndex]: forceIndex
        })}
        {...rest}
        tabIndex={rowLink || forceIndex ? 0 : -1}
      >
        {this.props.children}
        {selected && (
          <td colSpan={0}>
            <ActiveCaret className={classes.activeCaret} />
          </td>
        )}
      </_TableRow>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  styled
)(TableRow);

export default enhanced;
