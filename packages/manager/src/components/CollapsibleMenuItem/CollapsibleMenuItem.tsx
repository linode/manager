import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import CircularProgress from 'src/components/core/CircularProgress';
import { IconButton } from 'src/components/IconButton';
import MenuItem, { MenuItemProps } from 'src/components/core/MenuItem';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

interface WrapperMenuItemProps {
  tooltip?: string;
  isLoading?: boolean;
  ref?: any;
}

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    position: 'relative',
    flexWrap: 'wrap',
    '&.hasTooltip': {
      opacity: 1,
      paddingTop: `calc(${theme.spacing(1)} - 2)`,
      paddingBottom: theme.spacing(1) + 2,
      '&:hover, &:focus': {
        background: 'transparent',
        color: theme.palette.primary.main,
        '& $toolTip': {
          marginTop: theme.spacing(1),
          maxHeight: 200,
          opacity: 1,
        },
      },
    },
  },
  labelWrapper: {
    display: 'flex',
    flexBasis: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    opacity: 0.5,
  },
  toolTip: {
    transition: theme.transitions.create(['max-height', 'opacity', 'margin']),
    maxHeight: 0,
    display: 'block',
    color: theme.palette.text.primary,
    opacity: 0,
  },
  helpButton: {
    width: 28,
    height: 28,
    padding: 0,
    color: theme.palette.primary.main,
    pointerEvents: 'initial',
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
  },
  helpIcon: {
    width: 20,
    height: 20,
  },
  circleProgress: {
    position: 'absolute',
    left: 0,
    right: 0,
    margin: '0 auto',
  },
}));

type CombinedProps = MenuItemProps & WrapperMenuItemProps;

export const WrapperMenuItem = (props: CombinedProps) => {
  const { classes } = useStyles();
  const { tooltip, isLoading, className, ...rest } = props;
  const shouldWrapLabel = isLoading || tooltip;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <MenuItem
      {...rest}
      className={`${classes.root} ${className} ${tooltip && 'hasTooltip'}`}
    >
      {isLoading && (
        <CircularProgress size={20} className={classes.circleProgress} />
      )}
      <span className={shouldWrapLabel && classes.labelWrapper}>
        <span className={shouldWrapLabel && classes.label}>
          {props.children}
        </span>
        {tooltip && !isLoading && (
          <IconButton
            className={classes.helpButton}
            onClick={(e) => handleClick(e)}
            data-qa-tooltip-icon
            size="large"
          >
            <HelpOutline className={classes.helpIcon} />
          </IconButton>
        )}
      </span>
      {tooltip && (
        <span className={classes.toolTip} data-qa-tooltip>
          {tooltip}
        </span>
      )}
    </MenuItem>
  );
};
