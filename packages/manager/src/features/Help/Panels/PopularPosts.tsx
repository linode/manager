import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  post: {
    marginBottom: theme.spacing(0.5),
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

export const PopularPosts = () => {
  const { classes } = useStyles();

  const renderPopularDocs = () => {
    return (
      <React.Fragment>
        <div className={classes.post}>
          <Link to="https://www.linode.com/docs/getting-started/">
            Getting Started with Linode
          </Link>
        </div>
        <div className={classes.post}>
          <Link to="https://www.linode.com/docs/security/securing-your-server/">
            How to Secure Your Server
          </Link>
        </div>
        <div className={classes.post}>
          <Link to="https://www.linode.com/docs/troubleshooting/troubleshooting/">
            Troubleshooting
          </Link>
        </div>
      </React.Fragment>
    );
  };

  const renderPopularForumPosts = () => {
    return (
      <React.Fragment>
        <div className={classes.post}>
          <Link to="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance">
            My Linode is unreachable after maintenance
          </Link>
        </div>
        <div className={classes.post}>
          <Link to="https://www.linode.com/community/questions/232/why-is-my-website-so-slow">
            Why is my website so slow?
          </Link>
        </div>
        <div className={classes.post}>
          <Link to="https://www.linode.com/community/questions/19082/i-just-created-my-first-linode-and-i-cant-send-emails-why">
            Ports 25, 465, and 587 blocked?
          </Link>
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
