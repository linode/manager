import * as React from 'react';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';

type ClassNames =
  | 'root'
  | 'wrapper'
  | 'postCard'
  | 'postTitle'
  | 'post'
  | 'withSeparator'
  | 'postLink';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    border: `1px solid ${theme.color.grey2}`,
    margin: `${theme.spacing.unit * 6}px 0`
  },
  postCard: {
    height: '100%',
    paddingRight: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 3
  },
  wrapper: {},
  postTitle: {
    marginBottom: theme.spacing.unit * 2
  },
  post: {
    marginBottom: theme.spacing.unit / 2,
    ...theme.typography.body1
  },
  postLink: {
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  withSeparator: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
});

type CombinedProps = WithStyles<ClassNames>;

class PopularPosts extends React.Component<CombinedProps, {}> {
  renderPopularDocs = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/docs/getting-started/"
            text="Getting Started with Linode"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/docs/security/securing-your-server/"
            text="How to Secure Your Server"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/docs/troubleshooting/troubleshooting/"
            text="Troubleshooting"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
      </React.Fragment>
    );
  };

  renderPopularForumPosts = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance"
            text="My Linode is unreachable after maintenance"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/community/questions/232/why-is-my-website-so-slow"
            text="Why is my website so slow?"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            link="https://www.linode.com/community/questions/479/stackscript-guide"
            text="Stackscript guide?"
            className={classes.postLink}
            absoluteIcon
          />
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Grid container className={classes.wrapper}>
          <Grid item xs={12} sm={6} className={classes.withSeparator}>
            <div className={classes.postCard} data-qa-documentation-link>
              <Typography variant="h3" className={classes.postTitle}>
                Most Popular Documentation:
              </Typography>
              {this.renderPopularDocs()}
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.postCard} data-qa-community-link>
              <Typography variant="h3" className={classes.postTitle}>
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

const styled = withStyles(styles);

export default styled(PopularPosts);
