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

type CSSClasses =
  'root'
  | 'button'
  | 'buttonActive'
  | 'buttonLeft'
  | 'buttonRight'
  | 'icon';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    border: '1px solid #333',
  },
  buttonActive: {
    backgroundColor: '#333',
    color: '#f3f3f3',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  buttonLeft: {
    borderWidth: '1px 0 1px 1px',
    borderRadius: '5px 0 0 5px',
  },
  buttonRight: {
    borderWidth: '1px 1px 1px 0',
    borderRadius: '0 5px 5px 0',
  },
  icon: {
    marginRight: theme.spacing.unit,
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
        List
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
        Grid
        </Button>
    </div>
  );
};

export default compose(
  styled,
)(ToggleBox);
