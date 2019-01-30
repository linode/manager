import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import MenuItem, { MenuItemProps } from 'src/components/core/MenuItem';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type CSSClasses =
  | 'root'
  | 'toolTip'
  | 'labelWrapper'
  | 'label'
  | 'helpButton'
  | 'helpIcon';

interface Props {
  tooltip?: string;
  className?: string;
}

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  root: {
    position: 'relative',
    flexWrap: 'wrap',
    '&.hasTooltip': {
      opacity: 1,
      paddingTop: 6,
      paddingBottom: 8,
      '&:hover, &:focus': {
        background: 'transparent',
        color: theme.palette.primary.main,
        '& $toolTip': {
          marginTop: theme.spacing.unit,
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
    flexBasis: '100%',
    color: theme.palette.text.primary,
    maxWidth: 200,
    opacity: 0
  },
  helpButton: {
    width: 28,
    height: 28,
    color: theme.palette.primary.main,
    pointerEvents: 'initial',
    '&:hover, &:focus': {
      color: theme.palette.primary.light
    }
  },
  helpIcon: {
    width: 20,
    height: 20
  }
});

const handleClick = (e: any) => {
  e.stopPropagation();
};

type CombinedProps = MenuItemProps & Props & WithStyles<CSSClasses>;

const WrapperMenuItem: React.StatelessComponent<CombinedProps> = props => {
  const { tooltip, classes, className, ...rest } = props;

  return (
    <MenuItem
      {...rest}
      className={`${classes.root} ${className} ${tooltip && 'hasTooltip'}`}
    >
      <span className={tooltip && classes.labelWrapper}>
        <span className={tooltip && classes.label}>{props.children}</span>
        {tooltip && (
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
};

const styled = withStyles(styles);

export default styled(WrapperMenuItem);
