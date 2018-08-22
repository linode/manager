import * as classNames from 'classnames';
import { pathOr, take } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Collapse from 'src/assets/icons/minus-square.svg';
import Expand from 'src/assets/icons/plus-square.svg';
import UserIcon from 'src/assets/icons/user.svg';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';

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
  | 'isCurrentUser';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
});

interface Props {
  reply?: Linode.SupportReply;
  ticket?: Linode.SupportTicket;
  open?: boolean;
  isCurrentUser: boolean;
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
    const { ticket, reply, isCurrentUser } = this.props;
    if (!ticket && !reply) { return; }
    let data: Data;
    if (ticket) {
      data = {
        gravatar_id: ticket.gravatar_id,
        gravatarUrl: pathOr('not found',['gravatarUrl'],ticket),
        date: ticket.opened,
        description: ticket.description,
        username: isCurrentUser ? "you" : ticket.opened_by,
        from_linode: false,
      }
    } else if (reply) {
      data = {
        gravatar_id: reply.gravatar_id,
        gravatarUrl: pathOr('not found',['gravatarUrl'],reply),
        date: reply.created,
        description: reply.description,
        username: isCurrentUser ? "you" : reply.created_by,
        from_linode: reply.from_linode,
      }
    }

    return data!;
  }

  getTruncatedText = (str: string, len: number) => {
    return str.length > len
      ? `${take(len, str)}...`
      : str
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

    const truncatedText = this.getTruncatedText(data.description, 175);
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
                  <Typography><DateTimeDisplay value={data.date} format={'YYYY/MM/DD - h:ssa'}/></Typography>
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
              <Typography>{text}</Typography>
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
        </Paper>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(ExpandableTicketPanel);
