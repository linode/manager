import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ExternalLink from 'src/components/ExternalLink';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  post: {
    marginBottom: theme.spacing(0.5),
    ...theme.typography.body1,
  },
  postLink: {
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    color: theme.textColors.linkActiveLight,
  },
  postTitle: {
    marginBottom: theme.spacing(2),
  },
  root: {
    margin: `${theme.spacing(6)} 0`,
  },
  withSeparator: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      borderLeft: 'none',
      marginTop: theme.spacing(4),
      paddingLeft: 0,
    },
  },
}));

const PopularPosts: React.FC = () => {
  const classes = useStyles();

  const renderPopularDocs = () => {
    return (
      <React.Fragment>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/docs/getting-started/"
            text="Getting Started with Linode"
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/docs/security/securing-your-server/"
            text="How to Secure Your Server"
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/docs/troubleshooting/troubleshooting/"
            text="Troubleshooting"
          />
        </div>
      </React.Fragment>
    );
  };

  const renderPopularForumPosts = () => {
    return (
      <React.Fragment>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance"
            text="My Linode is unreachable after maintenance"
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/community/questions/232/why-is-my-website-so-slow"
            text="Why is my website so slow?"
          />
        </div>
        <div className={classes.post}>
          <ExternalLink
            absoluteIcon
            className={classes.postLink}
            link="https://www.linode.com/community/questions/19082/i-just-created-my-first-linode-and-i-cant-send-emails-why"
            text="Ports 25, 465, and 587 blocked?"
          />
        </div>
      </React.Fragment>
    );
  };

  return (
    <Paper className={classes.root} variant="outlined">
      <Grid container>
        <Grid data-qa-documentation-link sm={6} xs={12}>
          <Typography className={classes.postTitle} variant="h3">
            Most Popular Documentation:
          </Typography>
          {renderPopularDocs()}
        </Grid>
        <Grid
          className={classes.withSeparator}
          data-qa-community-link
          sm={6}
          xs={12}
        >
          <Typography className={classes.postTitle} variant="h3">
            Most Popular Community Posts:
          </Typography>
          {renderPopularForumPosts()}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PopularPosts;
