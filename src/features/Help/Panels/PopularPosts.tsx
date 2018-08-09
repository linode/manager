import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'wrapper'
  | 'postCard'
  | 'postTitle'
  | 'post'
  | 'withSeparator';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    border: `1px solid ${theme.color.grey2}`,
    margin: `${theme.spacing.unit * 6}px 0`,
  },
  postCard: {
    height: '100%',
    paddingRight: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 3,
  },
  wrapper: {
    // marginTop: theme.spacing.unit * 2,
  },
  postTitle: {
    ...theme.typography.body1,
    marginBottom: theme.spacing.unit,
  },
  post: {
    marginBottom: theme.spacing.unit / 2,
    '& a:hover h3': {
      color: theme.color.headline,
      textDecoration: 'underline',
    },
  },
  withSeparator: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
});

interface Props { }

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class PopularPosts extends React.Component<CombinedProps, State> {
  state: State = {};

  renderPopularDocs = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}>
          <a target="_blank" href="https://linode.com/docs/platform/stackscripts/">
            <Typography variant="subheading">
              Automate Deployment with StackScripts
            </Typography>
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://linode.com/docs/platform/disk-images/linode-backup-service/"
          >
            <Typography variant="subheading">
              Linode Backup Service
            </Typography>
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://linode.com/docs/security/authentication/use-public-key-authentication-with-ssh/"
          >
            <Typography variant="subheading">
              Public Key Authentication with SSH
            </Typography>
          </a>
        </div>
      </React.Fragment>
    )
  }

  renderPopularForumPosts = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://linode.com/community/questions/16988/completing-install-of-phpmyadmin-on-centos-7"
          >
            <Typography variant="subheading">
              Completing Install of phpMyAdmin on CentOS 7
            </Typography>
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://linode.com/community/questions/16956/how-do-i-switch-from-a-commercial-ssl-to-lets-encrypt"
          >
            <Typography variant="subheading">
              How do I switch from a commercial SSL to Let's Encrypt?
            </Typography>
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://linode.com/community/questions/16945/how-can-i-install-angularcli-on-ubuntu-1604-lts"
          >
            <Typography variant="subheading">
              How can I install @angular/cli on ubuntu 16.04 LTS?
            </Typography>
          </a>
        </div>
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Grid
          container
          className={classes.wrapper}
        >
          <Grid
            item
            xs={12}
            sm={6}
            className={classes.withSeparator}
          >
            <div className={classes.postCard}>
              <Typography
                variant="subheading"
                className={classes.postTitle}
              >
                Most Popular Documentation:
              </Typography>
              {this.renderPopularDocs()}
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <div className={classes.postCard}>
              <Typography
                variant="subheading"
                className={classes.postTitle}
              >
                Most Popular Community Posts:
              </Typography>
              {this.renderPopularForumPosts()}
            </div>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(PopularPosts);
