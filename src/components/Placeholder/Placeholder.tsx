import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Typography from 'material-ui/Typography';

import Grid from 'src/components/Grid';
import LinodeTheme from 'src/theme';

type ClassNames = 'root'
  | 'title'
  | 'copy'
  | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  '@keyframes scaleIn': {
    from: {
      transform: 'translateX( -10px ) rotateY( -180deg )',
    },
    to: {
      transformOrigin: 'center center',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    padding: `${theme.spacing.unit * 2}px 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing.unit * 10}px 0`,
    },
  },
  copy: {
    textAlign: 'center',
    maxWidth: 350,
  },
  icon: {
    animation: 'scaleIn .5s ease-in-out',
    // backfaceVisibility: 'hidden',
    width: 225,
    height: 225,
    '& .outerCircle': {
      fill: 'white',
      stroke: LinodeTheme.bg.offWhite,
    },
    '& .insidePath path': {
      opacity: 0,
      animation: 'fadeIn .2s ease-in-out forwards .3s',
      stroke: theme.palette.primary.main,
    },
  },
  title: {
    fontWeight: 700,
  },
});

interface Props {
  icon?: React.ComponentType<any>;
  copy?: string;
  title?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Placeholder: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, copy, title, icon: Icon } = props;
  return (
    <Grid
      container
      spacing={24}
      alignItems="center"
      direction="column"
      justify="center"
      className={classes.root}
    >
      <Grid item xs={12}>
        {Icon &&
          <Icon className={classes.icon} />
        }
      </Grid>
      <Grid item xs={12}>
        <Typography variant="display2" className={classes.title}>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={10} className={classes.copy}>
        <Typography variant="body1">{copy}</Typography>
      </Grid>
    </Grid >
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
  copy: 'This feature is currently in development. Please check back soon.',
  title: 'Feature in Progress',
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Placeholder);
