import { SupportReply, SupportTicket } from '@linode/api-v4';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hively, shouldRenderHively } from './Hively';
import TicketDetailBody from './TicketDetailText';
import { OFFICIAL_USERNAMES } from './ticketUtils';
import UserIcon from 'src/assets/icons/account.svg';
import Avatar from '@mui/material/Avatar';

const useStyles = makeStyles((theme: Theme) => ({
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
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
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
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
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
  reply?: SupportReply;
  ticket?: SupportTicket;
  open?: boolean;
  isCurrentUser: boolean;
  parentTicket?: number;
  ticketUpdated?: string;
}

interface Data {
  gravatar_id: string;
  date: string;
  description: string;
  username: string;
  friendly_name: string;
  from_linode: boolean;
  ticket_id: string;
  reply_id: string;
  updated: string;
}

export const ExpandableTicketPanel = React.memo((props: Props) => {
  const classes = useStyles();

  const { open, parentTicket, reply, ticket, ticketUpdated } = props;

  const [data, setData] = React.useState<Data | undefined>(undefined);

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
        <Avatar
          src={`https://gravatar.com/avatar/${id}?d=404`}
          className={classes.leftIcon}
          alt="Gravatar"
        >
          <UserIcon />
        </Avatar>
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
      <Grid className={`${classes.content}`}>
        <Grid container className={classes.header}>
          <Grid className={classes.headerInner}>
            <Typography className={classes.userName} component="span">
              {data.friendly_name}
            </Typography>
            {data.from_linode && !OFFICIAL_USERNAMES.includes(data.username) ? (
              <Typography
                component="span"
                variant="body1"
                className={classes.expert}
              >
                <em>Linode Expert</em>
              </Typography>
            ) : null}
            <Typography variant="body1" component="span">
              commented <DateTimeDisplay value={data.date} />
            </Typography>
          </Grid>
        </Grid>
        <TicketDetailBody open={open} text={data.description} />
        {shouldRenderHively(data.from_linode, data.updated, data.username) && (
          <Hively
            linodeUsername={data.username}
            ticketId={data.ticket_id}
            replyId={data.reply_id}
          />
        )}
      </Grid>
    </Grid>
  );
});
