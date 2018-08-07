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
  | 'cardLeft'
  | 'cardRight'
  | 'post';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  cardRight: {
    borderLeft: `.2px solid ${theme.color.grey1}`,
  },
  cardLeft: {
    borderRight: `.2px solid ${theme.color.grey}`,
  },
  wrapper: {
    marginTop: theme.spacing.unit * 2,
    backgroundColor: theme.color.white,
    padding: theme.spacing.unit * 2,
  },
  post: {
    padding: theme.spacing.unit * 1,
  }
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
            Automate Deployment with StackScripts
          </a>
        </div>
        <div className={classes.post}>
          <a target="_blank" href="https://linode.com/docs/platform/disk-images/linode-backup-service/">
            Linode Backup Service
          </a>
        </div>
        <div className={classes.post}>
          <a target="_blank" href="https://linode
          .com/docs/security/authentication/use-public-key-authentication-with-ssh/">
            Public Key Authentication with SSH
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
          <a target="_blank" href="https://linode.com/community/questions/
          16988/completing-install-of-phpmyadmin-on-centos-7">
            Completing Install of phpMyAdmin on CentOS 7
          </a>
        </div>
        <div className={classes.post}>
          <a target="_blank" href="https://linode.com/community/questions/16956/
          how-do-i-switch-from-a-commercial-ssl-to-lets-encrypt">
            How do I switch from a commercial SSL to Let's Encrypt?
          </a>
        </div>
        <div className={classes.post}>
          <a target="_blank" href="https://linode.com/community/questions/
          16945/how-can-i-install-angularcli-on-ubuntu-1604-lts">
            How can I install @angular/cli on ubuntu 16.04 LTS?
          </a>
        </div>
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid
        container
        className={classes.wrapper}
      >
        <Grid
          item
          xs={6}
          className={classes.cardLeft}
        >
          <Paper>
            <Typography variant="subheading">
              Most Popular Documentation:
          </Typography>
            {this.renderPopularDocs()}
          </Paper>
        </Grid>
        <Grid
          item
          xs={6}
          className={classes.cardRight}
        >
          <Paper>
            <Typography variant="subheading">
              Most Popular Community Posts:
          </Typography>
            {this.renderPopularForumPosts()}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(PopularPosts);
