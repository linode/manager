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
import { getGravatarUrlFromHash } from 'src/utilities/gravatar';

type ClassNames = 'root'
  | 'userWrapper'
  | 'leftIcon'
  | 'paper'
  | 'paperOpen'
  | 'avatarCol'
  | 'userCol'
  | 'descCol'
  | 'expCol'
  | 'expButton'
  | 'toggle';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  userWrapper: {
    marginTop: theme.spacing.unit / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: 40,
    height: 40,
    transition: theme.transitions.create(['box-shadow']),
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '40px',
      height: '40px',
    },
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
  paper: {
    padding: theme.spacing.unit * 3,
  },
  paperOpen: {
    padding: theme.spacing.unit * 3,
  },
  avatarCol: {
    minWidth: 60,
  },
  userCol: {
    minWidth: 100,
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
  },
  toggle: {
    height: 24,
    width: 24,
  }
});

interface Props {
  reply?: Linode.SupportReply;
  ticket?: Linode.SupportTicket;
  open?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  open: boolean;
  gravatarUrl: string;
  data?: Data;
}

interface Data {
  gravatar_id: string;
  date: string;
  description: string;
  username: string;
  from_linode: boolean;
}

export class ExpandableTicketPanel extends React.Component<CombinedProps, State> {
  constructor(props:CombinedProps) {
    super(props);
    this.state = {
      open: pathOr(true, ['open'], this.props),
      gravatarUrl: '',
      data: this.getData(),
    }
  }

  togglePanel = () => {
    this.setState({ open: !this.state.open });
  }

  getData = () => {
    const { ticket, reply } = this.props;
    if (!ticket && !reply) { return; }
    let data: Data;
    if (ticket) {
      data = {
        gravatar_id: ticket.gravatar_id,
        date: ticket.opened,
        description: ticket.description,
        username: "you",
        from_linode: false,
      }
    } else if (reply) {
      data = {
        gravatar_id: reply.gravatar_id,
        date: reply.created,
        description: reply.description,
        username: reply.created_by,
        from_linode: reply.from_linode,
      }
    }
    this.setGravatarUrl(data!.gravatar_id);
    return data!;
  }

  getTruncatedText = (str: string, len: number) => {
    return str.length > len
      ? `${take(len, str)}...`
      : str
  }

  setGravatarUrl = (gravatarId:string) => {
    getGravatarUrlFromHash(gravatarId)
      .then((url) => {
        this.setState({ gravatarUrl: url });
      });
  }

  renderAvatar() {
    const { classes } = this.props;
    const { gravatarUrl } = this.state;
    if (!gravatarUrl) { return null; }
    return (gravatarUrl !== 'not found'
      ? <div className={classes.userWrapper}>
          <img src={gravatarUrl} className={classes.leftIcon} />
        </div>
      : <div className={classes.userWrapper}>
          <UserIcon className={classes.leftIcon} />
        </div>
    );
  }
  
  render() {
    const { classes } = this.props;
    const { data, open } = this.state;
    if (!data) { return };

    const truncatedText = this.getTruncatedText(data.description, 175);
    const text = open ? data.description : truncatedText;

    return (
      <Grid item className={classes.root}>
        <Paper className={open ? classes.paperOpen : classes.paper}>
          <Grid container direction="row" wrap="nowrap" justify="space-between" alignItems="flex-start">
            <Grid item sm={3} className={classes.userCol}>
              <Grid container>
                <Grid item>
                  {this.renderAvatar()}
                </Grid>
                <Grid item>
                  <Typography>{data.username}</Typography>
                  {data.from_linode && <Typography variant="body1">Linode Expert</Typography>}
                  <Typography><DateTimeDisplay value={data.date} format={'YYYY/MM/DD - h:ssa'}/></Typography>
                  </Grid>
                </Grid>
              </Grid>
            <Grid item sm={truncatedText !== data.description ? 8 : 9} className={classes.descCol}>
              <Typography>{text}</Typography>
            </Grid>
            {truncatedText !== data.description &&
              <Grid item sm={1} onClick={this.togglePanel} className={classes.expCol}>
                <IconButton className={classes.expButton}>
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