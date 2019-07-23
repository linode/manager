import Close from '@material-ui/icons/Close';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Mobile from 'src/assets/icons/mobile.svg';
import Resource from 'src/assets/icons/resource.svg';
import Streamline from 'src/assets/icons/streamline.svg';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { storage } from 'src/utilities/storage';

type ClassNames =
  | 'dialog'
  | 'content'
  | 'item'
  | 'itemTitle'
  | 'itemDesc'
  | 'icon'
  | 'actions'
  | 'closeIcon';

const styles = (theme: Theme) =>
  createStyles({
    dialog: {
      '& [role="document"]': {
        maxWidth: 960,
        maxHeight: '100%',
        overflowY: 'auto',
        margin: '0 auto'
      },
      '& .dialog-title': {
        border: 0,
        textAlign: 'center',
        marginBottom: 0,
        '& h2': {
          fontSize: '1.5rem'
        }
      }
    },
    content: {
      padding: `0 ${theme.spacing(4)}px`,
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: 0
      }
    },
    item: {
      margin: '0 auto',
      maxWidth: 220,
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      }
    },
    itemTitle: {
      marginBottom: theme.spacing(1)
    },
    itemDesc: {
      margin: '0 auto',
      [theme.breakpoints.down('sm')]: {
        maxWidth: 400
      }
    },
    icon: {
      margin: theme.spacing(2),
      color: theme.palette.primary.main,
      [theme.breakpoints.down('sm')]: {
        maxWidth: 75
      },
      '& .imp': {
        fill: theme.bg.pureWhite
      }
    },
    actions: {
      marginTop: theme.spacing(2)
    },
    closeIcon: {
      position: 'absolute',
      top: 5,
      right: 5,
      fill: theme.palette.text.primary,
      cursor: 'pointer'
    }
  });

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & RouteComponentProps<any> & WithStyles<ClassNames>;

class WelcomeBanner extends React.Component<CombinedProps, {}> {
  actions = () => (
    <Button
      onClick={this.props.onClose}
      buttonType="primary"
      data-qa-welcome-button
    >
      Let's go!
    </Button>
  );

  redirectToClassic = () => {
    if (storage.loginCloudManager.get()) {
      storage.loginCloudManager.set('-1');
    }

    storage.notifications.welcome.set('closed');
  };

  render() {
    const { classes } = this.props;

    return (
      <ConfirmationDialog
        open={this.props.open}
        title="Welcome to the New Cloud Manager!"
        className={classes.dialog}
        onClose={this.props.onClose}
        maxWidth={false}
        onBackdropClick={this.props.onClose}
      >
        <Hidden mdUp>
          <Close className={classes.closeIcon} onClick={this.props.onClose} />
        </Hidden>
        <Grid container className={classes.content}>
          <Grid item xs={12}>
            <Typography>
              We've added new features to help improve your experience and
              create a fresh new look. Help us build a better product for Linode
              customers like you. Share your feedback in the footer below.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} md={4} className={classes.item}>
                <Streamline className={classes.icon} />
                <Typography variant="h3" className={classes.itemTitle}>
                  Streamline Deployments
                </Typography>
                <Typography variant="body1" className={classes.itemDesc}>
                  Deploy a Linode, NodeBalancers, Block Storage Volume, or
                  Domain easily with step-by-step guidance.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} className={classes.item}>
                <Resource className={classes.icon} />
                <Typography variant="h3" className={classes.itemTitle}>
                  Find Resources
                </Typography>
                <Typography variant="body1" className={classes.itemDesc}>
                  Our new predictive search gives you quick access to support
                  documentation and community posts.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} className={classes.item}>
                <Mobile className={classes.icon} />
                <Typography variant="h3" className={classes.itemTitle}>
                  Access Anywhere
                </Typography>
                <Typography variant="body1" className={classes.itemDesc}>
                  With support for all major devices and screen sizes, it's easy
                  to stay connected.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.actions}>
            {this.actions()}
          </Grid>
          <Grid item xs={12}>
            <Typography>
              Go back to{' '}
              <a
                href="https://manager.linode.com"
                onClick={this.redirectToClassic}
              >
                Classic Manager
              </a>
              .
            </Typography>
          </Grid>
        </Grid>
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<any, any, any>(
  withRouter,
  styled
);

export default enhanced(WelcomeBanner);
