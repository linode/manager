import * as React from 'react';

import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';

type ClassNames = 'root'
  | 'searchHeading'
  | 'popularPostsRight'
  | 'popularPostsLeft'
  | 'contentBlock'
  | 'otherWaysHeading'
  | 'otherWays'
  | 'otherWaysWrapper'
  | 'post';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    backgroundColor: theme.color.green,
  },
  searchHeading: {
    textAlign: 'center',
    margin: theme.spacing.unit * 3,
    color: theme.color.white,
    fontSize: '1.2em',
  },
  popularPostsRight: {
    borderLeft: `.2px solid ${theme.color.grey1}`,
  },
  popularPostsLeft: {
    borderRight: `.2px solid ${theme.color.grey}`,
  },
  contentBlock: {
    marginTop: theme.spacing.unit * 2,
    backgroundColor: theme.color.white,
    padding: theme.spacing.unit * 2,
  },
  otherWaysWrapper: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
  },
  otherWaysHeading: {
    textAlign: 'center',
    marginTop: theme.spacing.unit * 4,
  },
  otherWays: {
    textAlign: 'center',
    backgroundColor: theme.color.white,
    margin: theme.spacing.unit * 2,
  },
  post: {
    padding: theme.spacing.unit * 1,
  }
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class SearchPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  renderPopularDocs = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
      </React.Fragment>
    )
  }

  renderPopularForumPosts = () => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
        <div className={classes.post}><Link target="_blank" to="/help">Hello World</Link></div>
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Paper
          className={classes.root}
        >
          <Typography
            variant="subheading"
            className={classes.searchHeading}
          >
            Ways to Get Help
        </Typography>
        </Paper>
        <Grid
          container
          className={classes.contentBlock}
        >
          <Grid
            item
            xs={6}
            className={classes.popularPostsLeft}
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
            className={classes.popularPostsRight}
          >
            <Paper>
              <Typography variant="subheading">
                Most Popular Community Posts:
              </Typography>
              {this.renderPopularForumPosts()}
            </Paper>
          </Grid>
        </Grid>
        <Typography
          variant="subheading"
          className={classes.otherWaysHeading}
        >
          Other Ways to Get Help
        </Typography>
        <Grid
          container
          className={classes.otherWaysWrapper}
        >
          <Grid
            item xs={5}
            className={classes.otherWays}
          >
            <LinodeIcon/>
            <Typography variant="subheading">
              View Documentation
            </Typography>
            <Typography variant="caption">
              View Linode Documentation
            </Typography>
          </Grid>
          <Grid
            item xs={5}
            className={classes.otherWays}
          >
            <LinodeIcon/>
            <Typography variant="subheading">
              Search the Community
            </Typography>
            <Typography variant="caption">
              Find help from other Linode users in the Community
            </Typography>
          </Grid>
          <Grid
            item xs={5}
            className={classes.otherWays}
          >
            <LinodeIcon/>
            <Typography variant="subheading">
              Talk to Ada
            </Typography>
            <Typography variant="caption">
              Chat with the Linode Support bot to help troubleshoot
            </Typography>
          </Grid>
          <Grid
            item xs={5}
            className={classes.otherWays}
          >
            <LinodeIcon/>
            <Typography variant="subheading">
              Customer Support
            </Typography>
            <Typography variant="caption">
              Reach out to the Linode Customer Support team for quick responses
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);
