import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import {
  default as _TableRow,
  TableRowProps as _TableRowProps,
} from '@mui/material/TableRow';

const useStyles = makeStyles()((theme: Theme) => ({
  activeCaret: {
    '&:after': {
      background: `linear-gradient(to right bottom, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
      content: '""',
      height: '50%',
      left: 0,
      position: 'absolute',
      top: '50%',
      width: 15,
    },
    '&:before': {
      background: `linear-gradient(to right top, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
      content: '""',
      height: '50%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: 15,
    },
  },
  activeCaretOverlay: {
    '&:after': {
      background: `linear-gradient(to right bottom, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
      bottom: 0,
      content: '""',
      height: '50%',
      left: 0,
      position: 'absolute',
      width: 15,
    },
    '&:before': {
      background: `linear-gradient(to right top, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
      content: '""',
      height: '50%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: 15,
    },
  },
  disabled: {
    '& td': {
      color: '#D2D3D4',
    },
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue1,
  },
  root: {
    backgroundColor: theme.bg.bgPaper,
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    [theme.breakpoints.up('md')]: {
      boxShadow: `inset 3px 0 0 transparent`,
    },
    transition: theme.transitions.create(['box-shadow']),
  },
  selected: {
    '& td': {
      '&:first-of-type': {
        borderLeft: `1px solid ${theme.palette.primary.light}`,
      },
      borderBottomColor: theme.palette.primary.light,
      borderTop: `1px solid ${theme.palette.primary.light}`,
      position: 'relative',
      [theme.breakpoints.down('lg')]: {
        '&:last-child': {
          borderRight: `1px solid ${theme.palette.primary.light}`,
        },
      },
    },
    '&:before': {
      backgroundColor: theme.bg.lightBlue1,
      borderColor: theme.borderColors.borderTable,
      transition: 'none',
    },
    backgroundColor: theme.bg.lightBlue1,
    boxShadow: `inset 3px 0 0 ${theme.bg.lightBlue1}`,
    transform: 'scale(1)',
  },
  selectedOuter: {
    padding: 0,
  },
  withForcedIndex: {
    '& td': {
      transition: theme.transitions.create(['color']),
    },
    '&:before': {
      borderLeft: `1px solid transparent`,
      paddingLeft: 4,
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
    },
    '&:hover': {
      '& td': {
        color: theme.palette.primary.light,
      },
      cursor: 'pointer',
    },
    transition: theme.transitions.create(['border-color']),
  },
}));

export interface TableRowProps extends _TableRowProps {
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  highlight?: boolean;
  htmlFor?: string;
  onKeyUp?: any;
  selected?: boolean;
}

export const TableRow = React.memo((props: TableRowProps) => {
  const { classes, cx } = useStyles();

  const {
    ariaLabel,
    className,
    disabled,
    domRef,
    forceIndex,
    highlight,
    selected,
    ...rest
  } = props;

  return (
    <_TableRow
      aria-label={ariaLabel ?? `View Details`}
      className={cx(className, {
        [classes.disabled]: disabled,
        [classes.highlight]: highlight,
        [classes.root]: true,
        [classes.selected]: selected,
        [classes.withForcedIndex]: forceIndex,
      })}
      ref={domRef}
      {...rest}
    >
      {props.children}
      {selected && (
        <Hidden lgDown>
          <td colSpan={0} className={classes.selectedOuter}>
            <span className={classes.activeCaret} />
            <span className={classes.activeCaretOverlay} />
          </td>
        </Hidden>
      )}
    </_TableRow>
  );
});
