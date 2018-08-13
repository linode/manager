import * as classNames from 'classnames';
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
import Notice from 'src/components/Notice';

import Chat from 'src/assets/icons/chat.svg';
import Community from 'src/assets/icons/community.svg';
import Documentation from 'src/assets/icons/document.svg';
import Support from 'src/assets/icons/support.svg';

type ClassNames = 'root'
| 'wrapper'
| 'heading'
| 'card'
| 'tileTitle'
| 'icon'
| 'ada';

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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.color.white,
    padding: theme.spacing.unit * 4,
    border: `1px solid ${theme.color.grey2}`,
    height: '100%',
  },
  tileTitle: {
    fontSize: '1.2rem',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  icon: {
    margin: '0 auto 16px',
    display: 'block',
    padding: 16,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.divider}`,
    width: 66,
    height: 66,
    color: theme.palette.primary.main,
  },
  ada: {
    color: '#3683DC',
    cursor: 'pointer',
  }
});

interface Props {}

interface State {
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  state: State = { };

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
    if (typeof this.ada === 'undefined') {
      this.setState({ error: 'There was an issue loading the chat at this time. Please try again later.' })
      return;
    }
    this.setState({ error: '' })
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
              <span className={classes.icon}><Documentation /></span>
                <Typography variant="subheading" className={classes.tileTitle}>
                  <a target="_blank" href="https://linode.com/docs/" className="black">View Documentation</a>
                </Typography>
              <Typography variant="caption">
                View Linode Documentation
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <span className={classes.icon}><Community /></span>
                <Typography variant="subheading" className={classes.tileTitle}>
                  <a target="_blank" href="https://linode.com/community/" className="black">Search the Community</a>
                </Typography>
              <Typography variant="caption">
                Find help from other Linode users in the Community
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <span className={classes.icon}><Chat /></span>
              <Typography
                variant="subheading"
                className={classNames({
                  [classes.tileTitle]: true,
                  [classes.ada]: true,
                })}
              >
                <a href="javascript:;" onClick={this.handleAdaInit} className="black">Talk to Ada</a>
              </Typography>
              {this.state.error &&
                <Notice error={true} text={this.state.error} />
              }
              <Typography variant="caption">
                Chat with the Linode Support bot to help troubleshoot
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.card}>
              <span className={classes.icon}><Support /></span>
                <Typography variant="subheading" className={classes.tileTitle}>
                  <Link to="/support/tickets" className="black">Customer Support</Link>
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
