import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Chat from 'src/assets/icons/chat.svg';
import Community from 'src/assets/icons/community.svg';
import Support from 'src/assets/icons/support.svg';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Tile from 'src/components/Tile';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';

type ClassNames =
  | 'root'
  | 'wrapper'
  | 'heading'
  | 'card'
  | 'tileTitle'
  | 'icon'
  | 'ada';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  wrapper: {
    marginTop: theme.spacing(4)
  },
  heading: {
    textAlign: 'center',
    marginBottom: theme.spacing(2)
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.color.white,
    padding: theme.spacing(4),
    border: `1px solid ${theme.color.grey2}`,
    height: '100%'
  },
  tileTitle: {
    fontSize: '1.2rem',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  icon: {
    margin: '0 auto 16px',
    display: 'block',
    padding: 16,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.divider}`,
    width: 66,
    height: 66,
    color: theme.palette.primary.main
  },
  ada: {
    color: '#3683DC',
    cursor: 'pointer'
  }
});

interface State {
  error?: string;
  drawerOpen: boolean;
}

type CombinedProps = RouteComponentProps<{}> & WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false
  };

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
      this.setState({
        error:
          'There was an issue loading the chat at this time. Please try again later.'
      });
      return;
    }
    this.setState({ error: '' });
    this.ada.show();
  };

  openTicketDrawer = (e: React.MouseEvent) => {
    this.setState({ drawerOpen: true });
  };

  closeTicketDrawer = () => {
    this.setState({ drawerOpen: false });
  };

  onTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    const { history } = this.props;
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors }
    });
    this.setState({
      drawerOpen: false
    });
  };

  render() {
    const { classes } = this.props;
    const { drawerOpen } = this.state;

    return (
      <React.Fragment>
        <Grid item>
          <Grid container className={classes.wrapper}>
            <Grid item xs={12}>
              <Typography variant="h2" className={classes.heading}>
                Didn't find what you need? Get help.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Tile
                title="Create a Community Post"
                description="Find help from other Linode users in the Community"
                icon={<Community />}
                link="https://linode.com/community/"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Tile
                title="Talk to Ada"
                description="Chat with the Linode Support bot to help troubleshoot"
                icon={<Chat />}
                link={this.handleAdaInit}
                errorText={this.state.error}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Tile
                title="Open a ticket"
                description="If you are not able to solve an issue with the resources listed above,
                you can contact Linode Support"
                icon={<Support />}
                link={this.openTicketDrawer}
              />
            </Grid>
          </Grid>
          <SupportTicketDrawer
            open={drawerOpen}
            onClose={this.closeTicketDrawer}
            onSuccess={this.onTicketCreated}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<any, any, any>(
  styled,
  withRouter
)(OtherWays);
