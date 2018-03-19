import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import CheckCircle from 'material-ui-icons/CheckCircle';

import Grid from 'material-ui/Grid';
import LinodeTheme from '../../../src/theme';

type CSSClasses =
'root'
| 'icon'
| 'checked'
| 'flex'
| 'heading'
| 'innerGrid'
| 'subheading';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit,
    maxWidth: 300,
    minWidth: 200,
    backgroundColor: LinodeTheme.bg.offWhite,
    padding: theme.spacing.unit * 2,
    border: '1px solid ' + `${LinodeTheme.bg.main}`,
    transition: `${'background-color .3s ease-in-out, '}
    ${'border-color .3s ease-in-out'}`,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '32%',
      marginRight: '1%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:last-child': {
        width: '33%',
        marginRight: 0,
      },
    },
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#f4f4f4',
      borderColor: '#C9CACB',
    },
    '&.selected': {
      borderColor: theme.palette.primary.main,
      '& $svg, & span': {
        color: theme.palette.primary.main,
      },
    },
  },
  icon: {
    '& svg, & span': {
      fontSize: '32px',
      color: '#939598',
    },
    '& img': {
      maxheight: '32px',
      maxWidth: '32px',
    },
  },
  checked: {
    '& svg': {
      fontSize: '20px',
      color: theme.palette.primary.main,
    },
  },
  heading: {
    fontWeight: 700,
    fontSize: '1em',
  },
  subheading: {
    fontSize: '0.8em',
  },
  innerGrid: {
    width: '100%',
    minHeight: 70,
  },
  flex: {
    flex: 1,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  renderIcon?: () => JSX.Element;
  heading: string;
  subheadings: string[];
  checked?: Boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

const SelectionCard: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    renderIcon,
    heading,
    subheadings,
    classes,
    checked,
  } = props;

  return (
    <Grid
      item
      className={`${classes.root} ${checked ? 'selected' : ''}`}
    >
      <Grid
        container
        alignItems="center"
        className={classes.innerGrid}
      >
        {renderIcon &&
          <Grid item className={classes.icon}>
            {renderIcon()}
          </Grid>
        }
        <Grid item className={classes.flex}>
          <div className={classes.heading}>
            {heading}
          </div>
          {subheadings.map((subheading) => {
            return (
              <div className={classes.subheading}>
                {subheading}
              </div>
            );
          })}
        </Grid>

        {checked &&
          <Grid item className={`${classes.icon} + ${classes.checked}`}>
            <CheckCircle />
          </Grid>
        }
      </Grid>
    </Grid>
  );
};

export default styled(SelectionCard);
