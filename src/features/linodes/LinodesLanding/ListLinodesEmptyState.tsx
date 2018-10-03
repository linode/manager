import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeSvg from 'src/assets/addnewmenu/linode.svg';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';

type CSSClasses = 'root'
  | 'copy'
  | 'icon' 
  | 'title';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
    width: 225,
    height: 225,
    '& use': {
      fill: theme.bg.main,
    },
    '& .outerCircle': {
      fill: theme.color.absWhite,
      stroke: theme.bg.offWhite,
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

type PropsWithStyles = WithStyles<CSSClasses> & RouteComponentProps<{}>;

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
        <Typography variant="display2" className={classes.title} data-qa-placeholder-title>
          You don't have any Linodes!
        </Typography>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Typography variant="body1">
          Host your next project on a Linode. Click the button below to choose a plan and deploy
          an image.
        </Typography>
        </Grid>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Button
            type="primary"
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
