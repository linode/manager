import { IconButton } from '@linode/ui';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { MenuItem } from 'src/components/MenuItem';

import type { Theme } from '@mui/material/styles';
import type { MenuItemProps } from 'src/components/MenuItem';

interface WrapperMenuItemProps {
  isLoading?: boolean;
  ref?: any;
  tooltip?: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  circleProgress: {
    left: 0,
    margin: '0 auto',
    position: 'absolute',
    right: 0,
  },
  helpButton: {
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
    color: theme.palette.primary.main,
    height: 28,
    padding: 0,
    pointerEvents: 'initial',
    width: 28,
  },
  helpIcon: {
    height: 20,
    width: 20,
  },
  label: {
    opacity: 0.5,
  },
  labelWrapper: {
    alignItems: 'center',
    display: 'flex',
    flexBasis: '100%',
    justifyContent: 'space-between',
  },
  root: {
    '&.hasTooltip': {
      '&:hover, &:focus': {
        '& $toolTip': {
          marginTop: theme.spacing(1),
          maxHeight: 200,
          opacity: 1,
        },
        background: 'transparent',
        color: theme.palette.primary.main,
      },
      opacity: 1,
      paddingBottom: theme.spacing(1) + 2,
      paddingTop: `calc(${theme.spacing(1)} - 2)`,
    },
    flexWrap: 'wrap',
    position: 'relative',
  },
  toolTip: {
    color: theme.palette.text.primary,
    display: 'block',
    maxHeight: 0,
    opacity: 0,
    transition: theme.transitions.create(['max-height', 'opacity', 'margin']),
  },
}));

interface WrapperMenuItemCombinedProps
  extends Omit<MenuItemProps, 'ref'>,
    WrapperMenuItemProps {}

export const WrapperMenuItem = (props: WrapperMenuItemCombinedProps) => {
  const { classes } = useStyles();
  const { className, isLoading, tooltip, ...rest } = props;
  const shouldWrapLabel = isLoading || tooltip;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <MenuItem
      {...rest}
      className={`${classes.root} ${className} ${tooltip && 'hasTooltip'}`}
    >
      <span className={shouldWrapLabel && classes.labelWrapper}>
        <span className={shouldWrapLabel && classes.label}>
          {props.children}
        </span>
        {tooltip && !isLoading && (
          <IconButton
            className={classes.helpButton}
            data-qa-tooltip-icon
            onClick={(e) => handleClick(e)}
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
