import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Collapse from 'src/assets/icons/minus-square.svg';
import Expand from 'src/assets/icons/plus-square.svg';
import UserIcon from 'src/assets/icons/user.svg';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import truncateText from 'src/utilities/truncateText'

type ClassNames = 'root'
  | 'userWrapper'
  | 'leftIcon'
  | 'userName'
  | 'paper'
  | 'paperOpen'
  | 'avatarCol'
  | 'userCol'
  | 'descCol'
  | 'expCol'
  | 'expButton'
  | 'toggle'
  | 'isCurrentUser'
  | 'formattedText'
  | 'hivelyContainer'
  | 'hivelyLink'
  | 'hivelyImage';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    width: '100%',
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit,
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
    height: 40,
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    color: theme.palette.text.primary,
  },
  userName: {
    whiteSpace: 'nowrap',
    fontWeight: 700,
    color: theme.color.headline,
  },
  paper: {
    padding: theme.spacing.unit * 3,
  },
  paperOpen: {
    '& $descCol': {
      animation: 'fadeIn 225ms linear forwards',
    },
  },
  avatarCol: {
    minWidth: 60,
  },
  userCol: {
    minWidth: 100,
    paddingRight: theme.spacing.unit * 4,

  },
  descCol: {},
  expCol: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  expButton: {
    position: 'relative',
    top: -theme.spacing.unit,
    left: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      top: 16,
      right: 16,
      left: 'auto',
    },
  },
  toggle: {
    height: 24,
    width: 24,
  },
  isCurrentUser: {
    backgroundColor: theme.color.grey2,
  },
  formattedText: {
    whiteSpace: 'pre-line',
  },
  hivelyLink: {
    textDecoration: 'none',
    color: theme.color.black,
    marginRight: theme.spacing.unit * 2,
  },
  hivelyImage: {
    width: '25px',
  },
  hivelyContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginTop: theme.spacing.unit * 2,
  }
});

interface Props {
  reply?: Linode.SupportReply;
  ticket?: Linode.SupportTicket;
  open?: boolean;
  isCurrentUser: boolean;
  parentTicket?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  open: boolean;
  data?: Data;
}

interface Data {
  gravatar_id: string;
  gravatarUrl: string;
  date: string;
  description: string;
  username: string;
  from_linode: boolean;
  ticket_id: string;
  reply_id: string;
}

export class ExpandableTicketPanel extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  constructor(props:CombinedProps) {
    super(props);
    this.state = {
      open: pathOr(true, ['open'], this.props),
      data: this.getData(),
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  togglePanel = () => {
    this.setState({ open: !this.state.open });
  }

  getData = () => {
    const { parentTicket, ticket, reply } = this.props;
    if (!ticket && !reply) { return; }
    let data: Data;
    if (ticket) {
      data = {
        ticket_id: String(ticket.id),
        reply_id: '',
        gravatar_id: ticket.gravatar_id,
        gravatarUrl: pathOr('not found',['gravatarUrl'],ticket),
        date: ticket.opened,
        description: ticket.description,
        username: ticket.opened_by,
        from_linode: false,
      }
    } else if (reply) {
      data = {
        ticket_id: parentTicket ? String(parentTicket) : '',
        reply_id: String(reply.id),
        gravatar_id: reply.gravatar_id,
        gravatarUrl: pathOr('not found',['gravatarUrl'],reply),
        date: reply.created,
        description: reply.description,
        username: reply.created_by,
        from_linode: reply.from_linode,
      }
    }

    return data!;
  }

  renderHively = (linodeUsername: string, ticketId: string, replyId: string) => {
    const { classes } = this.props;
    const href = `https://secure.teamhively.com/ratings/add/account/587/source/hs/ext/${linodeUsername}/ticket/${ticketId}-${replyId}/rating/`;
    return (
      <div className={classes.hivelyContainer}>
        <Divider />
        <a className={classes.hivelyLink} href={href + '3'}>How did I do?</a>
        <span>
          <a href={href + '3'}>
            <img
              className={classes.hivelyImage}
              src={"https://secure.teamhively.com/system/smileys/icons/000/000/001/px_45/happy_base.png?1468984347"}
            />
          </a>
          <a href={href + '2'}>
            <img
              className={classes.hivelyImage}
              src={"https://secure.teamhively.com/system/smileys/icons/000/000/002/px_45/satisfied_base.png?1468984347"}
            />
          </a>
          <a href={href + '1'}>
            <img
              className={classes.hivelyImage}
              src={"https://secure.teamhively.com/system/smileys/icons/000/000/003/px_45/unhappy_base.png?1468984347"}
            />
          </a>
        </span>
      </div>
    )
  }

  renderAvatar(url: string) {
    const { classes } = this.props;

    return (url !== 'not found')
      ? <div className={classes.userWrapper}>
          <img src={url} className={classes.leftIcon} />
        </div>
      : <div className={classes.userWrapper}>
          <UserIcon className={classes.leftIcon} />
        </div>
  }

  render() {
    const { classes, isCurrentUser } = this.props;
    const { data, open } = this.state;
    if (!data) { return };

    const truncatedText = truncateText(data.description, 175);
    const text = open ? data.description : truncatedText;

    return (
      <Grid item className={classes.root}>
        <Paper className={
            classNames({
              [classes.paper]: true,
              [classes.paperOpen]: open,
              [classes.isCurrentUser]: isCurrentUser,
            })
          }>
          <Grid container direction="row" justify="space-between" alignItems="flex-start">
            <Grid
              item
              xs={11}
              sm={5}
              md={3}
              className={classes.userCol}
            >
              <Grid container wrap="nowrap">
                <Grid item style={{ paddingLeft: 0 }}>
                  {this.renderAvatar(data.gravatarUrl)}
                </Grid>
                <Grid item>
                  <Typography className={classes.userName}>{data.username}</Typography>
                  {data.from_linode && <Typography variant="body1">Linode Expert</Typography>}
                  <Typography><DateTimeDisplay value={data.date} /></Typography>
                  </Grid>
                </Grid>
              </Grid>
            <Grid
              item
              xs={truncatedText !== data.description ? 11 : 12}
              sm={truncatedText !== data.description ? 6 : 7}
              md={truncatedText !== data.description ? 8 : 9}
              className={classes.descCol}
            >
              <Typography className={classes.formattedText}>{text}</Typography>
            </Grid>
            {truncatedText !== data.description &&
              <Grid
                item
                xs={1}
                onClick={this.togglePanel}
                className={classes.expCol}
              >
                <IconButton className={classes.expButton} aria-label="Expand full answer">
                  {open ? <Collapse className={classes.toggle} /> : <Expand className={classes.toggle} />}
                </IconButton>
              </Grid>
            }
          </Grid>
          {data.from_linode &&
            this.renderHively(data.username, data.ticket_id, data.reply_id)
          }
        </Paper>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(ExpandableTicketPanel);
