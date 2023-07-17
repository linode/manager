import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Community from 'src/assets/icons/community.svg';
import Support from 'src/assets/icons/support.svg';
import { Tile } from 'src/components/Tile/Tile';
import { Typography } from 'src/components/Typography';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

type ClassNames =
  | 'card'
  | 'heading'
  | 'icon'
  | 'root'
  | 'tileTitle'
  | 'wrapper';

const styles = (theme: Theme) =>
  createStyles({
    card: {
      alignItems: 'center',
      backgroundColor: theme.color.white,
      border: `1px solid ${theme.color.grey2}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: theme.spacing(4),
    },
    heading: {
      marginBottom: theme.spacing(1),
      textAlign: 'center',
    },
    icon: {
      border: `2px solid ${theme.palette.divider}`,
      borderRadius: '50%',
      color: theme.palette.primary.main,
      display: 'block',
      height: 66,
      margin: '0 auto 16px',
      padding: 16,
      width: 66,
    },
    root: {},
    tileTitle: {
      fontSize: '1.2rem',
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    wrapper: {
      marginTop: theme.spacing(4),
    },
  });

interface State {
  drawerOpen: boolean;
  error?: string;
}

type CombinedProps = RouteComponentProps<{}> & WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  render() {
    const { classes } = this.props;
    const { drawerOpen } = this.state;

    return (
      <>
        <Grid className={classes.wrapper} container spacing={2}>
          <Grid xs={12}>
            <Typography className={classes.heading} variant="h2">
              Didn&rsquo;t find what you need? Get help.
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
            container
          >
            <Grid md={4} sm={6} xs={12}>
              <Tile
                description="Find help from other Linode users in the Community Find help from other Linode "
                icon={<Community />}
                link="https://linode.com/community/"
                title="Create a Community Post"
              />
            </Grid>
            <Grid md={4} sm={6} xs={12}>
              <Tile
                description="If you are not able to solve an issue with the resources listed above,
                you can contact Linode Support"
                icon={<Support />}
                link={this.openTicketDrawer}
                title="Open a ticket"
              />
            </Grid>
          </Grid>
        </Grid>
        <SupportTicketDialog
          onClose={this.closeTicketDrawer}
          onSuccess={this.onTicketCreated}
          open={drawerOpen}
        />
      </>
    );
  }

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
      state: { attachmentErrors },
    });
    this.setState({
      drawerOpen: false,
    });
  };

  openTicketDrawer = () => {
    this.setState({ drawerOpen: true });
  };

  state: State = {
    drawerOpen: false,
  };
}

const styled = withStyles(styles);

export default compose<any, any, any>(styled, withRouter)(OtherWays);
