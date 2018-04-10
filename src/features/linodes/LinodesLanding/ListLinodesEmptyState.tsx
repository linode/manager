import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';
import LinodeSvg from 'src/assets/addnewmenu/linode.svg';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import LinodeTheme from 'src/theme';

type CSSClasses = 'root' | 'copy' | 'button' | 'icon' | 'title';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
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
    maxWidth: 390,
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
  button: {
    borderRadius: '4px',
  },

});

interface Props { }

type PropsWithStyles = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

class ListLinodesEmptyState extends React.Component<PropsWithStyles> {
  render() {
    const { classes } = this.props;

    return (
      <Grid
      container
      spacing={24}
      alignItems="center"
      direction="column"
      justify="center"
      className={classes.root}
    >
        <Grid item xs={12}><LinodeSvg className={classes.icon} /></Grid>
        <Typography variant="display2" className={classes.title}>
          You dont have any Linodes!
        </Typography>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Typography variant="body1">
          Host your next project on a Linode. Click the button below to choose a plan and deploy
          an image.
        </Typography>
        </Grid>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Button
            variant="raised"
            color="primary"
            className={classes.button}
            onClick={() => this.props.history.push('/linodes/create')}
          >
            Add New Linode
          </Button>
        </Grid>
      </Grid>
    );
  }
}
const enhanced = compose(
  withRouter,
  withStyles(styles, { withTheme: true }),
);

export default enhanced(ListLinodesEmptyState);
