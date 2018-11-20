import * as React from 'react';
import Arrow from 'src/assets/icons/diagonalArrow.svg';

import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'wrapper'
  | 'postCard'
  | 'postTitle'
  | 'post'
  | 'withSeparator'
  | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
    '&:hover': {
      '& $icon': {
        opacity: 1,
        margin: '0 10px',
      },
    },
    '& h3': {
      color: theme.color.headline,
      textDecoration: 'underline',
      display: 'inline-block',
    },
  },
  withSeparator: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  icon: {
    display: 'inline-block',
    width: 12,
    height: 12,
    opacity: 0,
  },
});

type CombinedProps = WithStyles<ClassNames>;

class PopularPosts extends React.Component<CombinedProps, {}> {
  renderPopularDocs = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://www.linode.com/docs/getting-started/"
            data-qa-doc-link
          >
            <Typography variant="subheading">
              Getting Started with Linode
            </Typography>
            <Arrow className={classes.icon} />
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://www.linode.com/docs/security/securing-your-server/"
            data-qa-doc-link
          >
            <Typography variant="subheading">
              How to Secure Your Server
            </Typography>
            <Arrow className={classes.icon} />
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://www.linode.com/docs/troubleshooting/troubleshooting/"
            data-qa-doc-link
          >
            <Typography variant="subheading">
              Troubleshooting
            </Typography>
            <Arrow className={classes.icon} />
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
            href="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance"
            data-qa-community-post
          >
            <Typography variant="subheading">
            My Linode is unreachable after maintenance
            </Typography>
            <Arrow className={classes.icon} />
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://www.linode.com/community/questions/232/why-is-my-website-so-slow"
            data-qa-community-post
          >
            <Typography variant="subheading">
              Why is my website so slow?
            </Typography>
            <Arrow className={classes.icon} />
          </a>
        </div>
        <div className={classes.post}>
          <a
            target="_blank"
            href="https://www.linode.com/community/questions/479/stackscript-guide"
            data-qa-community-post
          >
            <Typography variant="subheading">
              Stackscript guide?
            </Typography>
            <Arrow className={classes.icon} />
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

const styled = withStyles(styles);

export default styled(PopularPosts);
