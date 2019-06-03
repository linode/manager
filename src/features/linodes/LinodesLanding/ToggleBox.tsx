import { WithStyles } from '@material-ui/core/styles';
import ViewList from '@material-ui/icons/ViewList';
import ViewModule from '@material-ui/icons/ViewModule';
import * as React from 'react';
import { compose } from 'redux';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type CSSClasses =
  | 'root'
  | 'button'
  | 'buttonActive'
  | 'buttonLeft'
  | 'buttonRight'
  | 'icon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 8,
      marginRight: -8
    },
    button: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.color.boxShadow,
      borderRadius: 0,
      fontFamily: theme.font.bold,
      textTransform: 'inherit',
      width: 80,
      minWidth: 80,
      padding: '6px 14px 5px 12px',
      minHeight: 'inherit',
      fontSize: '1rem',
      lineHeight: '1.3em',
      color: theme.palette.text.primary,
      '&:focus': {
        backgroundColor: theme.color.white
      },
      '&:hover': {
        backgroundColor: 'transparent',
        '& $icon': {
          opacity: 1
        }
      }
    },
    buttonActive: {
      backgroundColor: theme.color.white,
      '&:hover': {
        backgroundColor: theme.color.white
      }
    },
    buttonLeft: {
      width: 79
    },
    buttonRight: {
      borderLeftWidth: 0
    },
    icon: {
      marginRight: 6,
      width: 18,
      height: 18,
      opacity: 0.4,
      transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
    }
  });

interface Props {
  handleClick: (v: 'grid' | 'list') => void;
  status: 'grid' | 'list';
}

const styled = withStyles(styles);

type CombinedProps = Props & WithStyles<CSSClasses>;

export const ToggleBox: React.StatelessComponent<CombinedProps> = props => {
  const { classes, handleClick, status } = props;

  return (
    <div className={classes.root} data-qa-active-view={props.status}>
      <Button
        onClick={() => handleClick('list')}
        className={`
            ${!status || (status === 'list' && classes.buttonActive)}
            ${classes.button}
            ${classes.buttonLeft}`}
        data-qa-view="list"
      >
        <ViewList className={classes.icon} />
        List
      </Button>
      <Button
        onClick={() => handleClick('grid')}
        className={`
            ${status === 'grid' && classes.buttonActive}
            ${classes.button}
            ${classes.buttonRight}`}
        data-qa-view="grid"
      >
        <ViewModule className={classes.icon} />
        Grid
      </Button>
    </div>
  );
};

export default compose(styled)(ToggleBox);
