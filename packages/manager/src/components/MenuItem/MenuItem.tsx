import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import CircularProgress from 'src/components/core/CircularProgress';
import { IconButton } from 'src/components/IconButton';
import MenuItem, { MenuItemProps } from 'src/components/core/MenuItem';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

type CSSClasses =
  | 'root'
  | 'toolTip'
  | 'labelWrapper'
  | 'label'
  | 'helpButton'
  | 'helpIcon'
  | 'circleProgress';

interface Props {
  tooltip?: string;
  className?: string;
  isLoading?: boolean;
  ref?: any;
}

const styles = (theme: Theme) =>
  createStyles({
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
  });

const handleClick = (e: any) => {
  e.stopPropagation();
};
type CombinedProps = MenuItemProps & Props & WithStyles<CSSClasses>;

class WrapperMenuItem extends React.Component<CombinedProps> {
  render() {
    const { className, classes, isLoading, tooltip, ...rest } = this.props;

    const shouldWrapLabel = isLoading || tooltip;

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
            {this.props.children}
          </span>
          {tooltip && !isLoading && (
            <IconButton
              className={classes.helpButton}
              onClick={handleClick}
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
  }
}

const styled = withStyles(styles);

export default styled(WrapperMenuItem);
