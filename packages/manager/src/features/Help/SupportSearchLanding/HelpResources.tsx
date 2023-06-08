import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Community from 'src/assets/icons/community.svg';
import Support from 'src/assets/icons/support.svg';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Tile } from 'src/components/Tile/Tile';
import Grid from '@mui/material/Unstable_Grid2';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';

const useStyles = makeStyles()((theme: Theme) => ({
  wrapper: {
    marginTop: theme.spacing(4),
  },
  heading: {
    textAlign: 'center',
    marginBottom: theme.spacing(1),
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
}));

const OtherWays = (props: RouteComponentProps) => {
  const { classes } = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const openTicketDrawer = () => {
    setDrawerOpen(true);
  };

  const closeTicketDrawer = () => {
    setDrawerOpen(false);
  };

  const onTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    const { history } = props;
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
    });
    setDrawerOpen(false);
  };

  return (
    <>
      <Grid container className={classes.wrapper} spacing={2}>
        <Grid xs={12}>
          <Typography variant="h2" className={classes.heading}>
            Didn&rsquo;t find what you need? Get help.
          </Typography>
        </Grid>
        <Grid
          container
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Grid xs={12} sm={6} md={4}>
            <Tile
              title="Create a Community Post"
              description="Find help from other Linode users in the Community Find help from other Linode "
              icon={<Community />}
              link="https://linode.com/community/"
            />
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Tile
              title="Open a ticket"
              description="If you are not able to solve an issue with the resources listed above,
                you can contact Linode Support"
              icon={<Support />}
              link={openTicketDrawer}
            />
          </Grid>
        </Grid>
      </Grid>
      <SupportTicketDrawer
        open={drawerOpen}
        onClose={closeTicketDrawer}
        onSuccess={onTicketCreated}
      />
    </>
  );
};

export default compose<any, any>(withRouter)(OtherWays);
