import { WithStyles } from '@material-ui/core/styles';
import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import CircularProgress from 'src/components/core/CircularProgress';
import IconButton from 'src/components/core/IconButton';
import MenuItem, { MenuItemProps } from 'src/components/core/MenuItem';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

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
    root: {
      position: 'relative',
      flexWrap: 'wrap',
      '&.hasTooltip': {
        opacity: 1,
        paddingTop: theme.spacing(1) - 2,
        paddingBottom: theme.spacing(1) + 2,
        '&:hover, &:focus': {
          background: 'transparent',
          color: theme.palette.primary.main,
          '& $toolTip': {
            marginTop: theme.spacing(1),
            maxHeight: 200,
            opacity: 1
          }
        }
      }
    },
    labelWrapper: {
      display: 'flex',
      flexBasis: '100%',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    label: {
      opacity: 0.5
    },
    toolTip: {
      transition: theme.transitions.create(['max-height', 'opacity', 'margin']),
      maxHeight: 0,
      display: 'block',
      color: theme.palette.text.primary,
      opacity: 0
    },
    helpButton: {
      width: 28,
      height: 28,
      padding: 0,
      color: theme.palette.primary.main,
      pointerEvents: 'initial',
      '&:hover, &:focus': {
        color: theme.palette.primary.light
      }
    },
    helpIcon: {
      width: 20,
      height: 20
    },
    circleProgress: {
      position: 'absolute',
      left: 0,
      right: 0,
      margin: '0 auto'
    }
  });

const handleClick = (e: any) => {
  e.stopPropagation();
};
type CombinedProps = MenuItemProps & Props & WithStyles<CSSClasses>;

class WrapperMenuItem extends React.Component<CombinedProps> {
  render() {
    const { tooltip, classes, className, isLoading, ...rest } = this.props;

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
