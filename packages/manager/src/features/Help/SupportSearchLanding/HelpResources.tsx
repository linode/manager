import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import Community from 'src/assets/icons/community.svg';
import Support from 'src/assets/icons/support.svg';
import { Tile } from 'src/components/Tile/Tile';
import { Typography } from 'src/components/Typography';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

const useStyles = makeStyles()((theme: Theme) => ({
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
  wrapper: {
    marginTop: theme.spacing(4),
  },
}));

export const HelpResources = () => {
  const { classes } = useStyles();
  const history = useHistory();
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
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
    });
    setDrawerOpen(false);
  };

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
              link={openTicketDrawer}
              title="Open a ticket"
            />
          </Grid>
        </Grid>
      </Grid>
      <SupportTicketDialog
        onClose={closeTicketDrawer}
        onSuccess={onTicketCreated}
        open={drawerOpen}
      />
    </>
  );
};

export default HelpResources;
