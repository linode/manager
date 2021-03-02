import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import _TableRow, {
  TableRowProps as _TableRowProps,
} from 'src/components/core/TableRow';

type ClassNames =
  | 'root'
  | 'selected'
  | 'withForcedIndex'
  | 'activeCaret'
  | 'activeCaretOverlay'
  | 'selectedOuter'
  | 'highlight'
  | 'disabled';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      transition: theme.transitions.create(['box-shadow']),
      [theme.breakpoints.up('md')]: {
        boxShadow: `inset 3px 0 0 transparent`,
      },
    },
    withForcedIndex: {
      '& td': {
        transition: theme.transitions.create(['color']),
      },
      transition: theme.transitions.create(['border-color']),
      '&:before': {
        borderLeft: `1px solid transparent`,
        paddingLeft: 4,
      },
      '&:hover': {
        cursor: 'pointer',
        '& td': {
          color: theme.palette.primary.light,
        },
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue,
      },
    },
    selected: {
      backgroundColor: theme.bg.lightBlue,
      transform: 'scale(1)',
      boxShadow: `inset 3px 0 0 ${theme.bg.lightBlue}`,
      '&:before': {
        transition: 'none',
        backgroundColor: theme.bg.lightBlue,
        borderColor: theme.palette.primary.light,
      },
      '& td': {
        borderTopColor: theme.palette.primary.light,
        borderBottomColor: theme.palette.primary.light,
        position: 'relative',
        '&:first-child': {
          borderLeft: `1px solid ${theme.palette.primary.light}`,
        },
        [theme.breakpoints.down('md')]: {
          '&:last-child': {
            borderRight: `1px solid ${theme.palette.primary.light}`,
          },
        },
      },
    },
    selectedOuter: {
      padding: 0,
    },
    activeCaret: {
      '&:before': {
        content: '""',
        width: 15,
        height: '50%',
        position: 'absolute',
        left: 0,
        top: 0,
        background: `linear-gradient(to right top, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
      },
      '&:after': {
        content: '""',
        width: 15,
        height: '50%',
        position: 'absolute',
        left: 0,
        top: '50%',
        background: `linear-gradient(to right bottom, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
      },
    },
    activeCaretOverlay: {
      '&:before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        width: 15,
        height: '50%',
        background: `linear-gradient(to right top, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 45%, transparent 46.1%)`,
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 15,
        height: '50%',
        background: `linear-gradient(to right bottom, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 45%, transparent 46.1%)`,
      },
    },
    highlight: {
      backgroundColor: theme.bg.lightBlue,
    },
    disabled: {
      backgroundColor: 'rgba(247, 247, 247, 0.25)',
      '& td': {
        color: '#D2D3D4',
      },
    },
  });

type onClickFn = (e: React.ChangeEvent<HTMLTableRowElement>) => void;

export interface Props {
  rowLink?: string | onClickFn;
  onClick?: onClickFn;
  onKeyUp?: any;
  className?: string;
  staticContext?: boolean;
  htmlFor?: string;
  selected?: boolean;
  forceIndex?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  domRef?: any;
}

export type CombinedProps = Props &
  _TableRowProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

export class TableRow extends React.Component<CombinedProps> {
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
      highlight,
      disabled,
      ariaLabel,
      domRef,
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
        aria-label={ariaLabel ?? `View Details`}
        className={classNames(className, {
          [classes.root]: true,
          [classes.selected]: selected,
          [classes.withForcedIndex]: forceIndex,
          [classes.highlight]: highlight,
          [classes.disabled]: disabled,
        })}
        innerRef={domRef}
        {...rest}
        tabIndex={rowLink || forceIndex ? 0 : -1}
      >
        {this.props.children}
        {selected && (
          <Hidden mdDown>
            <td colSpan={0} className={classes.selectedOuter}>
              <span className={classes.activeCaret} />
              <span className={classes.activeCaretOverlay} />
            </td>
          </Hidden>
        )}
      </_TableRow>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(withRouter, styled)(TableRow);

export default enhanced;
