import * as React from 'react';
import { compose } from 'redux';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import ViewList from 'material-ui-icons/ViewList';
import ViewModule from 'material-ui-icons/ViewModule';
import LinodeTheme from 'src/theme';

type CSSClasses =
  'root'
  | 'button'
  | 'buttonActive'
  | 'buttonLeft'
  | 'buttonRight'
  | 'icon'
  | 'buttonText';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 2,
    [theme.breakpoints.up('sm')]: {
      position: 'absolute',
      right: theme.spacing.unit,
      top: theme.spacing.unit,
      marginBottom: 0,
    },
  },
  button: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: LinodeTheme.color.border1,
    borderRadius: 0,
    fontWeight: 700,
    textTransform: 'inherit',
    width: 80,
    minWidth: 80,
    padding: '6px 12px 5px',
    minHeight: 'inherit',
    fontSize: '1rem',
    lineHeight: '1.3em',
    color: LinodeTheme.color.grey1,
    transition: 'color 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: LinodeTheme.palette.text.primary,
      backgroundColor: 'transparent',
    },
  },
  buttonActive: {
    backgroundColor: LinodeTheme.color.grey1,
    fontWeight: 400,
    color: 'white',
    '&:hover': {
      backgroundColor: LinodeTheme.color.grey1,
      color: 'white',
    },
  },
  buttonLeft: {
    borderRightWidth: 0,
  },
  buttonRight: {
    borderLeftWidth: 0,
  },
  icon: {
    marginRight: theme.spacing.unit / 2,
    width: 18,
    height: 18,
  },
  buttonText: {
    width: 30,
    position: 'relative',
    top: -1,
  },
});

interface Props {
  handleClick: (v: 'grid' | 'list') => void;
  status: 'grid' | 'list';
}

const styled = withStyles(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<CSSClasses>;

export const ToggleBox: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    handleClick,
    status,
  } = props;

  return (
    <div className={classes.root}>
      <Button
        onClick={() => handleClick('list')}
        className={`
            ${!status || status === 'list' && classes.buttonActive}
            ${classes.button}
            ${classes.buttonLeft}`
        }
      >
        <ViewList className={classes.icon} />
        <span className={classes.buttonText}>List</span>
        </Button>
      <Button
        onClick={() => handleClick('grid')}
        className={`
            ${status === 'grid' && classes.buttonActive}
            ${classes.button}
            ${classes.buttonRight}`
        }
      >
        <ViewModule className={classes.icon} />
        <span className={classes.buttonText}>Grid</span>
        </Button>
    </div>
  );
};

export default compose(
  styled,
)(ToggleBox);
