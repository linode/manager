import * as classNames from 'classnames';
import * as moment from 'moment';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';
import UserIcon from 'src/assets/icons/user.svg';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';

import { sanitizeHTML } from 'src/utilities/sanitize-html';
import TicketDetailBody from './TicketDetailText';

type ClassNames =
  | 'root'
  | 'userWrapper'
  | 'leftIcon'
  | 'userName'
  | 'paper'
  | 'avatarCol'
  | 'userCol'
  | 'isCurrentUser'
  | 'hivelyContainer'
  | 'hivelyLink'
  | 'hivelyLinkIcon'
  | 'hivelyImage';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
    padding: theme.spacing.unit * 2,
    position: 'relative',
    '& p': {
      margin: 0,
      padding: 0
    }
  },
  userWrapper: {
    marginTop: theme.spacing.unit / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: 40,
    height: 40
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    color: theme.palette.text.primary
  },
  userName: {
    whiteSpace: 'nowrap',
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    color: theme.color.headline
  },
  paper: {
    padding: theme.spacing.unit * 3
  },
  avatarCol: {
    minWidth: 60
  },
  userCol: {
    minWidth: 200,
    paddingRight: `${theme.spacing.unit * 4}px !important`
  },
  isCurrentUser: {
    backgroundColor: theme.color.grey2
  },
  hivelyLink: {
    textDecoration: 'none',
    color: theme.color.black,
    marginRight: theme.spacing.unit * 2
  },
  hivelyImage: {
    width: '25px',
    margin: 3
  },
  hivelyContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginTop: theme.spacing.unit * 3
  },
  hivelyLinkIcon: {
    display: 'inline-block',
    marginRight: theme.spacing.unit
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

export const shouldRenderHively = (
  fromLinode: boolean,
  updated: string,
  username?: string
) => {
  /* Render Hively only for replies marked as from_linode,
   * and are on tickets less than 7 days old,
   * and when the user is not "Linode"
   * Defaults to showing Hively if there are any errors parsing dates
   * or the date is invalid.
   */
  try {
    if (username === 'Linode') {
      return false;
    }
    const lastUpdated = moment(updated);
    if (!lastUpdated.isValid()) {
      return true;
    }
    const diff = moment.duration(moment().diff(lastUpdated));
    return fromLinode && diff <= moment.duration(7, 'days');
  } catch {
    return true;
  }
};

export const ExpandableTicketPanel: React.FC<CombinedProps> = props => {
  const {
    classes,
    isCurrentUser,
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

  const renderHively = (
    linodeUsername: string,
    ticketId: string,
    replyId: string
  ) => {
    const href = `https://secure.teamhively.com/ratings/add/account/587/source/hs/ext/${linodeUsername}/ticket/${ticketId}-${replyId}/rating/`;
    return (
      <div className={classes.hivelyContainer}>
        <Divider />
        <a className={classes.hivelyLink} href={href + '3'} target="_blank">
          How did I do?
        </a>
        <span>
          <a
            href={href + '3'}
            target="_blank"
            className={classes.hivelyLinkIcon}
          >
            <img
              className={classes.hivelyImage}
              src={
                'https://secure.teamhively.com/system/smileys/icons/000/000/541/px_25/icon_positive.png'
              }
            />
          </a>
          <a
            href={href + '2'}
            target="_blank"
            className={classes.hivelyLinkIcon}
          >
            <img
              className={classes.hivelyImage}
              src={
                'https://secure.teamhively.com/system/smileys/icons/000/000/542/px_25/icon_indifferent.png'
              }
            />
          </a>
          <a
            href={href + '1'}
            target="_blank"
            className={classes.hivelyLinkIcon}
          >
            <img
              className={classes.hivelyImage}
              src={
                'https://secure.teamhively.com/system/smileys/icons/000/000/543/px_25/icon_negative.png'
              }
            />
          </a>
        </span>
      </div>
    );
  };

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
      <Paper
        className={classNames({
          [classes.paper]: true,
          [classes.isCurrentUser]: isCurrentUser
        })}
      >
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
        >
          <Grid item xs={11} sm={5} md={3} className={classes.userCol}>
            <Grid container wrap="nowrap">
              <Grid item style={{ paddingLeft: 0 }}>
                {renderAvatar(data.gravatarUrl)}
              </Grid>
              <Grid item>
                <Typography className={classes.userName}>
                  {data.username}
                </Typography>
                {data.from_linode && (
                  <Typography variant="body1">Linode Expert</Typography>
                )}
                <Typography variant="body1" style={{ marginTop: 8 }}>
                  <DateTimeDisplay value={data.date} humanizeCutoff={'month'} />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <TicketDetailBody
            open={open}
            dangerouslySetInnerHTML={{
              __html: data.description
            }}
          />
        </Grid>
        {shouldRenderHively(data.from_linode, data.updated, data.username) &&
          renderHively(data.username, data.ticket_id, data.reply_id)}
      </Paper>
    </Grid>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ExpandableTicketPanel);
