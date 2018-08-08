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
| 'card'
| 'tileTitle';

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
    height: '100%',
  },
  tileTitle: {
    fontSize: '1.2rem',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    '&:hover': {
      color: theme.color.headline,
      textDecoration: 'underline',
    },
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
    if ('AdaChaperone' in window) {
      this.ada = new (window as any).AdaChaperone('linode');
    }
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
          variant="title"
          className={classes.heading}
        >
          Other Ways to Get Help
        </Typography>
        <Grid
          container
          className={classes.wrapper}
        >
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <a target="_blank" href="https://linode.com/docs/">
                <Typography variant="subheading" className={classes.tileTitle}>View Documentation</Typography>
              </a>
              <Typography variant="caption">
                View Linode Documentation
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <a target="_blank" href="https://linode.com/community/">
                <Typography variant="subheading" className={classes.tileTitle}>Search the Community</Typography>
              </a>
              <Typography variant="caption">
                Find help from other Linode users in the Community
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <LinodeIcon />
                <a onClick={this.handleAdaInit}>
                  <Typography variant="subheading" className={classes.tileTitle}>Talk to Ada</Typography>
                </a>
              <Typography variant="caption">
                Chat with the Linode Support bot to help troubleshoot
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <LinodeIcon />
              <Link to="/support/tickets">
                <Typography variant="subheading" className={classes.tileTitle}>Customer Support</Typography>
              </Link>
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
