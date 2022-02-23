import classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import _TableRow, { TableRowProps } from 'src/components/core/TableRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    backgroundColor: theme.bg.bgPaper,
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
      backgroundColor: theme.bg.lightBlue1,
    },
  },
  selected: {
    backgroundColor: theme.bg.lightBlue1,
    transform: 'scale(1)',
    boxShadow: `inset 3px 0 0 ${theme.bg.lightBlue1}`,
    '&:before': {
      transition: 'none',
      backgroundColor: theme.bg.lightBlue1,
      borderColor: theme.borderColors.borderTable,
    },
    '& td': {
      borderTop: `1px solid ${theme.palette.primary.light}`,
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
      background: `linear-gradient(to right top, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
    },
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue1,
  },
  disabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
    '& td': {
      color: '#D2D3D4',
    },
  },
}));

type onClickFn = (e: React.ChangeEvent<HTMLTableRowElement>) => void;

export interface Props {
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  highlight?: boolean;
  htmlFor?: string;
  onClick?: onClickFn;
  onKeyUp?: any;
  selected?: boolean;
}

export type CombinedProps = Props & TableRowProps & RouteComponentProps<{}>;

export const TableRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    className,
    ariaLabel,
    disabled,
    domRef,
    forceIndex,
    highlight,
    selected,
    // Defining `staticContext` here to prevent `...rest` from containing it
    // since it leads to a console warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    staticContext,
    ...rest
  } = props;

  return (
    <_TableRow
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
    >
      {props.children}
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
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  React.memo
)(TableRow);

export default enhanced;
