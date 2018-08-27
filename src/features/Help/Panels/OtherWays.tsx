import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import Tile from 'src/components/Tile';

import Chat from 'src/assets/icons/chat.svg';
import Community from 'src/assets/icons/community.svg';
import Documentation from 'src/assets/icons/document.svg';
import Support from 'src/assets/icons/support.svg';

type ClassNames = 'root'
| 'wrapper'
| 'heading'

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  wrapper: {
    marginTop: theme.spacing.unit * 2,
  },
  heading: {
    textAlign: 'center',
    marginBottom: theme.spacing.unit * 4,
  },
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
            <Tile
              title="View Documentation"
              description="View Linode Documentation"
              icon={<Documentation />}
              link="https://linode.com/docs/"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Search the Community"
              description="Find help from other Linode users in the Community"
              icon={<Community />}
              link="https://linode.com/community/"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Talk to Ada"
              description="Chat with the Linode Support bot to help troubleshoot"
              icon={<Chat />}
              link={this.handleAdaInit}
            />  
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Customer Support"
              description="If you are not able to solve an issue with the resources listed above,
              you can contact Linode Support"
              icon={<Support />}
              link="/support/tickets"
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(OtherWays);
