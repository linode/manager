// import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';
import UserIcon from 'src/assets/icons/user.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';

import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { Hively, shouldRenderHively } from './Hively';
import TicketDetailBody from './TicketDetailText';

type ClassNames =
  | 'root'
  | 'userWrapper'
  | 'leftIcon'
  | 'userName'
  | 'content'
  | 'header'
  | 'avatarCol'
  | 'isCurrentUser'
  | 'hivelyContainer'
  | 'hivelyLink'
  | 'hivelyLinkIcon'
  | 'hivelyImage';

const styles = (theme: Theme) =>
  createStyles({
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
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
      position: 'relative',
      '& p': {
        margin: 0,
        padding: 0
      }
    },
    userWrapper: {
      marginTop: theme.spacing(1) / 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      width: 40,
      height: 40,
      marginRight: theme.spacing(1),
      position: 'relative',
      top: -4
    },
    leftIcon: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      color: theme.palette.text.primary
    },
    content: {
      width: '100%',
      maxWidth: '66.66%',
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      backgroundColor: theme.color.white,
      border: `1px solid ${theme.color.grey3}`,
      borderRadius: theme.shape.borderRadius
    },
    header: {
      padding: `0 ${theme.spacing(1)}px`,
      backgroundColor: theme.color.grey2,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius
    },
    userName: {
      whiteSpace: 'nowrap',
      fontFamily: 'LatoWebBold', // we keep this bold at all times
      color: theme.color.headline
    },
    avatarCol: {
      minWidth: 60
    },
    isCurrentUser: {
      // backgroundColor: theme.color.grey2
    }
  });

interface Props {
  reply?: Linode.SupportReply;
  ticket?: Linode.SupportTicket;
  open?: boolean;
  isCurrentUser: boolean;
  parentTicket?: number;
  ticketUpdated?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
  const {
    classes,
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
      /** convert markdown to mark up */
      const convertedMarkdown = new Converter({
        extensions: ['highlightjs'],
        simplifiedAutoLink: true,
        openLinksInNewWindow: true
      }).makeHtml(ticket.description);

      return setData({
        ticket_id: String(ticket.id),
        reply_id: '',
        gravatar_id: ticket.gravatar_id,
        gravatarUrl: pathOr('not found', ['gravatarUrl'], ticket),
        date: ticket.opened,
        description: sanitizeHTML(convertedMarkdown),
        username: ticket.opened_by,
        from_linode: false,
        updated: ticket.updated
      });
    } else if (reply) {
      /** convert markdown to markup */
      const convertedMarkdown = new Converter({
        extensions: ['highlightjs'],
        simplifiedAutoLink: true,
        openLinksInNewWindow: true
      }).makeHtml(reply.description);

      return setData({
        ticket_id: parentTicket ? String(parentTicket) : '',
        reply_id: String(reply.id),
        gravatar_id: reply.gravatar_id,
        gravatarUrl: pathOr('not found', ['gravatarUrl'], reply),
        date: reply.created,
        description: sanitizeHTML(convertedMarkdown),
        username: reply.created_by,
        from_linode: reply.from_linode,
        updated: ticketUpdated!
      });
    }
  }, []);

  const renderAvatar = (url: string) => {
    return url !== 'not found' ? (
      <div className={classes.userWrapper}>
        <img src={url} className={classes.leftIcon} alt="Gravatar" />
      </div>
    ) : (
      <div className={classes.userWrapper}>
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
                <Grid item>
                  <Typography className={classes.userName} component="span">
                    {data.username}
                  </Typography>
                  {data.from_linode && (
                    <Typography component="span" variant="body1">
                      {' '}
                      <em>Linode Expert</em>
                    </Typography>
                  )}
                  <Typography variant="body1" component="span">
                    {' '}
                    commented on{' '}
                    <DateTimeDisplay
                      value={data.date}
                      humanizeCutoff={'month'}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <TicketDetailBody
                open={open}
                dangerouslySetInnerHTML={{
                  __html: data.description
                }}
              />
              {!shouldRenderHively(
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ExpandableTicketPanel);
