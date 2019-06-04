import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import LinodeSvg from 'src/assets/addnewmenu/linode.svg';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type CSSClasses = 'root' | 'copy' | 'icon' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes scaleIn': {
      from: {
        transform: 'translateX( -10px ) rotateY( -180deg )'
      },
      to: {
        transformOrigin: 'center center'
      }
    },
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      padding: `${theme.spacing(2)}px 0`,
      [theme.breakpoints.up('md')]: {
        padding: `${theme.spacing(10)}px 0`
      }
    },
    copy: {
      textAlign: 'center',
      maxWidth: 800
    },
    icon: {
      animation: 'scaleIn .5s ease-in-out',
      width: 225,
      height: 225,
      '& use': {
        fill: theme.bg.main
      },
      '& .outerCircle': {
        fill: theme.color.absWhite,
        stroke: theme.bg.offWhite
      },
      '& .insidePath path': {
        opacity: 0,
        animation: 'fadeIn .2s ease-in-out forwards .3s',
        stroke: theme.palette.primary.main
      }
    },
    title: {
      fontFamily: theme.font.bold,
      textAlign: 'center'
    }
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
        <Grid item xs={12}>
          <LinodeSvg className={classes.icon} />
        </Grid>
        <Typography
          variant="h4"
          className={classes.title}
          data-qa-placeholder-title
        >
          Add your first Linode!
        </Typography>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Typography variant="subtitle1">
            Choose a plan, select an image, and deploy within minutes. Need help
            getting started?
          </Typography>
          <Typography variant="subtitle1">
            <a
              href="https://linode.com/docs/getting-started-new-manager/"
              target="_blank"
              className="h-u"
            >
              Learn more about getting started
            </a>
            &nbsp;or&nbsp;
            <a
              href="https://www.linode.com/docs/"
              target="_blank"
              className="h-u"
            >
              visit our guides and tutorials.
            </a>
          </Typography>
        </Grid>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Button
           buttonType="primary"
            onClick={() => this.props.history.push('/linodes/create')}
          >
            Create a Linode
          </Button>
        </Grid>
      </Grid>
    );
  }
}
const enhanced = compose(
  withRouter,
  withStyles(styles)
);

export default enhanced(ListLinodesEmptyState);
