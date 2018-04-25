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
  | 'icon';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    margin: `${theme.spacing.unit * 2}px 0`,
    [theme.breakpoints.up('sm')]: {
      position: 'absolute',
      right: 0,
      top: 0,
      margin: 0,
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
    padding: '6px 14px 5px 12px',
    minHeight: 'inherit',
    fontSize: '1rem',
    lineHeight: '1.3em',
    color: LinodeTheme.palette.text.primary,
    '&:hover': {
      backgroundColor: 'transparent',
      '& $icon': {
        opacity: 1,
      },
    },
  },
  buttonActive: {
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white',
    },
  },
  buttonLeft: {
    width: 79,
  },
  buttonRight: {
    borderLeftWidth: 0,
  },
  icon: {
    marginRight: 6,
    width: 18,
    height: 18,
    opacity: .4,
    transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
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
    <div className={classes.root} data-qa-active-view={props.status}>
      <Button
        onClick={() => handleClick('list')}
        className={`
            ${!status || status === 'list' && classes.buttonActive}
            ${classes.button}
            ${classes.buttonLeft}`
        }
        data-qa-view="list"
      >
        <ViewList className={classes.icon}/>
        List
        </Button>
      <Button
        onClick={() => handleClick('grid')}
        className={`
            ${status === 'grid' && classes.buttonActive}
            ${classes.button}
            ${classes.buttonRight}`
        }
        data-qa-view="grid"
      >
        <ViewModule className={classes.icon} />
        Grid
        </Button>
    </div>
  );
};

export default compose(
  styled,
)(ToggleBox);
