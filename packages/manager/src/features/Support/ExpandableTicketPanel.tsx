import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import UserIcon from 'src/assets/icons/account.svg';
import { Avatar as NewAvatar } from 'src/components/Avatar/Avatar';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { GravatarOrAvatar } from 'src/components/GravatarOrAvatar';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile/profile';

import { Hively, shouldRenderHively } from './Hively';
import { TicketDetailText } from './TicketDetailText';
import { OFFICIAL_USERNAMES } from './ticketUtils';

import type { SupportReply, SupportTicket } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  content: {
    backgroundColor: theme.color.white,
    border: `1px solid ${theme.color.grey2}`,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    width: '100%',
  },
  expert: {
    marginRight: 4,
    whiteSpace: 'nowrap',
  },
  header: {
    backgroundColor: theme.color.grey2,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    minHeight: 40,
    padding: `0 ${theme.spacing(1)}`,
  },
  headerInner: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  leftIcon: {
    borderRadius: '50%',
    color: theme.palette.text.primary,
    height: '100%',
    width: '100%',
  },
  userName: {
    color: theme.color.headline,
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    marginRight: 4,
    whiteSpace: 'nowrap',
  },
  userWrapper: {
    alignItems: 'center',
    borderRadius: '50%',
    display: 'flex',
    height: 32,
    justifyContent: 'center',
    marginTop: theme.spacing(0.5),
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      height: 40,
      marginRight: theme.spacing(1),
      width: 40,
    },
    top: -2,
    width: 32,
  },
}));

interface Props {
  isCurrentUser: boolean;
  open?: boolean;
  parentTicket?: number;
  reply?: SupportReply;
  ticket?: SupportTicket;
  ticketUpdated?: string;
}

interface Data {
  date: string;
  description: string;
  friendly_name: string;
  from_linode: boolean;
  gravatar_id: string;
  reply_id: string;
  ticket_id: string;
  updated: string;
  username: string;
}

export const ExpandableTicketPanel = React.memo((props: Props) => {
  const { classes } = useStyles();

  const theme = useTheme();

  const { open, parentTicket, reply, ticket, ticketUpdated } = props;

  const [data, setData] = React.useState<Data | undefined>(undefined);

  const { data: profile } = useProfile();

  React.useEffect(() => {
    if (!ticket && !reply) {
      return;
    }
    if (ticket) {
      return setData({
        date: ticket.opened,
        description: ticket.description,
        friendly_name: ticket.opened_by,
        from_linode: false,
        gravatar_id: ticket.gravatar_id,
        reply_id: '',
        ticket_id: String(ticket.id),
        updated: ticket.updated,
        username: ticket.opened_by,
      });
    } else if (reply) {
      return setData({
        date: reply.created,
        description: reply.description,
        friendly_name: reply.friendly_name,
        from_linode: reply.from_linode,
        gravatar_id: reply.gravatar_id,
        reply_id: String(reply.id),
        ticket_id: parentTicket ? String(parentTicket) : '',
        updated: ticketUpdated!,
        username: reply.created_by,
      });
    }
  }, [parentTicket, reply, ticket, ticketUpdated]);

  const renderAvatar = (id: string) => {
    return (
      <div className={classes.userWrapper}>
        <GravatarOrAvatar
          avatar={
            <NewAvatar
              color={
                data?.username !== profile?.username
                  ? theme.palette.primary.dark
                  : undefined
              }
              sx={{ marginTop: 1 }}
              username={data?.username}
            />
          }
          gravatar={
            <Avatar
              alt="Gravatar"
              className={classes.leftIcon}
              src={`https://gravatar.com/avatar/${id}?d=404`}
            >
              <UserIcon />
            </Avatar>
          }
        />
      </div>
    );
  };

  /**
   * data.description will be a blank string if it contained ONLY malicious markup
   * because we sanitize it in this.getData()
   */
  if (!data || !data.description) {
    return null;
  }

  return (
    <Grid container wrap="nowrap">
      <Grid>{renderAvatar(data.gravatar_id)}</Grid>
      <Grid className={classes.content}>
        <Grid className={classes.header} container>
          <Grid className={classes.headerInner}>
            <Typography className={classes.userName} component="span">
              {data.friendly_name}
            </Typography>
            {data.from_linode && !OFFICIAL_USERNAMES.includes(data.username) ? (
              <Typography
                className={classes.expert}
                component="span"
                variant="body1"
              >
                <em>Customer Support</em>
              </Typography>
            ) : null}
            <Typography component="span" variant="body1">
              commented <DateTimeDisplay value={data.date} />
            </Typography>
          </Grid>
        </Grid>
        <TicketDetailText open={open} text={data.description} />
        {shouldRenderHively(data.from_linode, data.updated, data.username) && (
          <Hively
            linodeUsername={data.username}
            replyId={data.reply_id}
            ticketId={data.ticket_id}
          />
        )}
      </Grid>
    </Grid>
  );
});
