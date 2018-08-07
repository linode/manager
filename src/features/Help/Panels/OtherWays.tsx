import * as React from 'react';

import { Link } from 'react-router-dom';

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
| 'wrapper'
| 'heading'
| 'card';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  wrapper: {
    marginTop: theme.spacing.unit * 2,
  },
  heading: {
    textAlign: 'center',
    marginBottom: theme.spacing.unit * 4,
  },
  card: {
    textAlign: 'center',
    backgroundColor: theme.color.white,
    padding: theme.spacing.unit * 4,
    border: `1px solid ${theme.color.grey2}`,
  },
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  state: State = {};

  ada: any = undefined;

  componentDidMount() {
    /*
    * Init Ada Chaperone chat app
    * Script is included in index.html
    */
    this.ada = new (window as any).AdaChaperone('linode');
  }

  handleAdaInit = () => {
    /*
    * Show the Ada chat
    */
    this.ada.show();
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography
          variant="subheading"
          className={classes.heading}
        >
          Other Ways to Get Help
        </Typography>
        <Grid
          container
          className={classes.wrapper}
        >
          <Grid item xs={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <Typography variant="subheading">
                <a target="_blank" href="https://linode.com/docs/">View Documentation</a>
              </Typography>
              <Typography variant="caption">
                View Linode Documentation
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <Typography variant="subheading">
              <a target="_blank" href="https://linode.com/community/">Search the Community</a>
              </Typography>
              <Typography variant="caption">
                Find help from other Linode users in the Community
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <Typography variant="subheading">
                <a onClick={this.handleAdaInit}>Talk to Ada</a>
              </Typography>
              <Typography variant="caption">
                Chat with the Linode Support bot to help troubleshoot
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <Typography variant="subheading">
                <Link to="/support/tickets">Customer Support</Link>
              </Typography>
              <Typography variant="caption">
                If you are not able to solve an issue with the resources listed above, you can
                contact Linode Support
              </Typography>
            </div>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(OtherWays);
