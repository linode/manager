import * as React from 'react';
import { compose } from 'recompose';
import UserIcon from 'src/assets/icons/user.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import useFlags from 'src/hooks/useFlags';

import { ExtendedReply, ExtendedTicket } from './types';
import { Hively, shouldRenderHively } from './Hively';
import TicketDetailBody from './TicketDetailText';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    width: '100%',
    padding: 0,
    marginBottom: theme.spacing(2),
    position: 'relative'
  },
  userWrapper: {
    marginTop: theme.spacing(1) / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: 32,
    height: 32,
    position: 'relative',
    top: -2,
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(1),
      width: 40,
      height: 40
    }
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    color: theme.palette.text.primary
  },
  content: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.color.white,
    border: `1px solid ${theme.color.grey2}`,
    borderRadius: theme.shape.borderRadius
  },
  header: {
    padding: `0 ${theme.spacing(1)}px`,
    minHeight: 40,
    backgroundColor: theme.color.grey2,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius
  },
  headerInner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  userName: {
    whiteSpace: 'nowrap',
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    color: theme.color.headline,
    marginRight: 4
  },
  expert: {
    marginRight: 4,
    whiteSpace: 'nowrap'
  },
  isCurrentUser: {},
  cmrSpacing: {
    [theme.breakpoints.down(1100)]: {
      marginLeft: theme.spacing()
    }
  }
}));

interface Props {
  reply?: ExtendedReply;
  ticket?: ExtendedTicket;
  open?: boolean;
  isCurrentUser: boolean;
  parentTicket?: number;
  ticketUpdated?: string;
}

type CombinedProps = Props;

interface Data {
  gravatar_id: string;
  gravatarUrl: string;
  date: string;
  description: string;
  username: string;
  from_linode: boolean;
  ticket_id: string;
  reply_id: string;
  updated: string;
}

export const ExpandableTicketPanel: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const {
    // isCurrentUser,
    parentTicket,
    ticket,
    open,
    reply,
    ticketUpdated
  } = props;

  const [data, setData] = React.useState<Data | undefined>(undefined);

  React.useEffect(() => {
    if (!ticket && !reply) {
      return;
    }
    if (ticket) {
      return setData({
        ticket_id: String(ticket.id),
        reply_id: '',
        gravatar_id: ticket.gravatar_id,
        gravatarUrl: ticket.gravatarUrl ?? 'not found',
        date: ticket.opened,
        description: ticket.description,
        username: ticket.opened_by,
        from_linode: false,
        updated: ticket.updated
      });
    } else if (reply) {
      return setData({
        ticket_id: parentTicket ? String(parentTicket) : '',
        reply_id: String(reply.id),
        gravatar_id: reply.gravatar_id,
        gravatarUrl: reply.gravatarUrl ?? 'not found',
        date: reply.created,
        description: reply.description,
        username: reply.created_by,
        from_linode: reply.from_linode,
        updated: ticketUpdated!
      });
    }
  }, [parentTicket, reply, ticket, ticketUpdated]);

  const renderAvatar = (url: string) => {
    return url !== 'not found' ? (
      <div
        className={`${classes.userWrapper} ${flags.cmr && classes.cmrSpacing}`}
      >
        <img src={url} className={classes.leftIcon} alt="Gravatar" />
      </div>
    ) : (
      <div
        className={`${classes.userWrapper} ${flags.cmr && classes.cmrSpacing}`}
      >
        <UserIcon className={classes.leftIcon} />
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
    <Grid item className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <Grid container wrap="nowrap">
            <Grid item>{renderAvatar(data.gravatarUrl)}</Grid>
            <Grid item className={`${classes.content}`}>
              <Grid container className={classes.header}>
                <Grid item className={classes.headerInner}>
                  <Typography className={classes.userName} component="span">
                    {data.username}
                  </Typography>
                  {data.from_linode && (
                    <Typography
                      component="span"
                      variant="body1"
                      className={classes.expert}
                    >
                      <em>Linode Expert</em>
                    </Typography>
                  )}
                  <Typography variant="body1" component="span">
                    commented <DateTimeDisplay value={data.date} />
                  </Typography>
                </Grid>
              </Grid>
              <TicketDetailBody open={open} text={data.description} />
              {shouldRenderHively(
                data.from_linode,
                data.updated,
                data.username
              ) && (
                <Hively
                  linodeUsername={data.username}
                  ticketId={data.ticket_id}
                  replyId={data.reply_id}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ExpandableTicketPanel);
