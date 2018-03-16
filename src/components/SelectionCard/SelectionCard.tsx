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
| 'flex'
| 'heading'
| 'innerGrid'
| 'subheading';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 2,
    maxWidth: 300,
    minWidth: 225,
  },
  icon: {
    '& svg, & span': {
      fontSize: '32px',
    },
    '& img': {
      maxheight: '32px',
      maxWidth: '32px',
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
    backgroundColor: LinodeTheme.bg.offWhite,
    padding: theme.spacing.unit * 2,
    border: '1px solid ' + `${LinodeTheme.bg.main}`,
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
  flex: {
    flex: 1,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  renderIcon: () => JSX.Element;
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
      xs={4}
      className={classes.root}
    >
      <Grid
        container
        alignItems="center"
        className={classes.innerGrid}
      >
        <Grid item className={classes.icon}>
          {renderIcon()}
        </Grid>

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
          <Grid item>
            <CheckCircle />
          </Grid>
        }
      </Grid>
    </Grid>
  );
};

export default styled(SelectionCard);
