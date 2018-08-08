import * as Bluebird from 'bluebird';
import * as classNames from 'classnames';
import { compose, concat, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { getTicket, getTicketReplies, SupportTicket } from 'src/services/support';
import { getGravatarUrlFromHash } from 'src/utilities/gravatar';

import ExpandableTicketPanel from '../ExpandableTicketPanel';
import TicketReply from './TicketReply';


type ClassNames = 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'listParent'
  | 'label'
  | 'labelIcon'
  | 'status'
  | 'open'
  | 'closed';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '2px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  label: {
    marginBottom: theme.spacing.unit,
  },
  labelIcon: {
    marginLeft: -theme.spacing.unit,
    paddingRight: 0,
  },
  listParent: {
  },
  status: {
    marginLeft: theme.spacing.unit,
    padding: theme.spacing.unit,
    color: theme.color.white,
  },
  open: {
    backgroundColor: theme.color.green,
  },
  closed: {
    backgroundColor: theme.color.red,
  },
});

type RouteProps = RouteComponentProps<{ ticketId?: number }>;

interface ConnectedProps {
  profileUsername: string;
}

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  replies?: Linode.SupportReply[];
  ticket?: Linode.SupportTicket;
}

type CombinedProps = RouteProps & ConnectedProps & WithStyles<ClassNames>;

const scrollToBottom = () => {
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: document.body.scrollHeight,
  });
}

export class SupportTicketDetail extends React.Component<CombinedProps,State> {
  mounted: boolean = false;
  state: State = {
    loading: true,
  }

  static docs: Linode.Doc[] = [
    {
      title: 'Linode Support',
      src: 'https://linode.com/docs/platform/billing-and-support/support/',
      body: `Linode provides live technical support services 24 hours a day, 7 days a week. Linode Support ensures network availability, verifies that you can access your Linode, resolves performance issues with hosts, and works to fix any service-related issues you may be experiencing.
      Linode also offers a number of resources you can refer to when troubleshooting application and server configuration issues. These issues are generally outside the scope of Linode Support, and the other resources Linode provides can help you find solutions for your questions.`,
    },
  ];

  componentDidMount() {
    this.mounted = true;
    this.loadTicketAndReplies();
  }

  loadTicket = () : any => {
    const ticketId = this.props.match.params.ticketId;
    if (!ticketId) { return null; }
    return getTicket(ticketId);
  }

  loadReplies = () : any => {
    const ticketId = this.props.match.params.ticketId;
    if (!ticketId) { return null; }
    return getTicketReplies(ticketId)
      .then((response) => {
        return response.data;
      });
  }

  handleJoinedPromise = (ticketResponse: SupportTicket, replyResponse: Linode.SupportReply[]) => {
    /** Gets a unique list of gravatar IDs */
    const uniqueGravatarIDs = replyResponse.reduce(reduceToUniqueGravatarIDs, [ticketResponse.gravatar_id]);

    /** Send a request for the gravatar for each unique ID. */
    return Bluebird.reduce(uniqueGravatarIDs, requestAndMapGravatar, {})
      .then((gravatarMap) => {
        /** We now have the gravatar map from the reducer above, and the replies from further up,
         * so we can merge them together.
         */
        this.setState({
          replies: replyResponse.map(matchGravatarURLToReply(gravatarMap)),
          ticket: {...ticketResponse, gravatarUrl: gravatarMap[ticketResponse.gravatar_id]},
          loading: false,
        }, scrollToBottom)
      });
  };

  loadTicketAndReplies = () => {
    Bluebird.join(this.loadTicket(), this.loadReplies(), this.handleJoinedPromise);
  }

  onBackButtonClick = () => {
    const { ticket } = this.state;
    if (!ticket) { this.props.history.push('/support/tickets'); }
    else {
      this.props.history.push({
        pathname: '/support/tickets',
        state:{ openFromRedirect: ['open','new'].includes(ticket.status)}
      });
    }
  }

  onCreateReplySuccess = (newReply:Linode.SupportReply) => {
    const replies = pathOr([], ['replies'], this.state);
    getGravatarUrlFromHash(newReply.gravatar_id)
      .then((url) => {
        newReply.gravatarUrl = url;
        const updatedReplies = concat(replies, [newReply]);
        this.setState({
          replies: updatedReplies,
        })
      })
  }

  getEntityIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <DomainIcon />
      case 'linode':
        return <LinodeIcon />
      case 'nodebalancer':
        return <NodebalIcon />
      case 'volume':
        return <VolumeIcon />
      default:
        return <LinodeIcon />
    }
  }

  renderEntityLabelWithIcon = () => {
    const { classes } = this.props;
    const { label, type } = this.state.ticket!.entity;
    const icon: JSX.Element = this.getEntityIcon(type);
    return (
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        className={classes.label}
      >
        <Grid item className={classes.labelIcon}>
          {icon}
        </Grid>
        <Grid item>
          {label}
        </Grid>
      </Grid>
    )
  }

  renderReplies = (replies: Linode.SupportReply[]) => {
    return replies.map((reply: Linode.SupportReply, idx: number) => {
      return <ExpandableTicketPanel
        key={idx}
        reply={reply}
        open={idx === replies.length - 1}
        isCurrentUser={this.props.profileUsername === reply.created_by}
      />
    });
  }

  render() {
    const { classes, profileUsername } = this.props;
    const { errors, loading, replies, ticket } = this.state;
    const ticketId = this.props.match.params.ticketId;

    /*
    * Including loading/error states here (rather than in a
    * renderContent function) because the header
    * depends on having a ticket object for its content.
    */

    // Loading
    if (loading) {
      return <CircleProgress />
    }

    // Error state
    if (errors) {
      return (
        <ErrorState
          errorText={errors[0].reason}
        />
      );
    }

    // Empty state
    if (!ticket) {
      return null;
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item className={classes.titleWrapper}>
            <IconButton
              onClick={this.onBackButtonClick}
              className={classes.backButton}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Typography variant="headline" className={classes.title} data-qa-domain-title>
              {`#${ticket.id}: ${ticket.summary}`}
              <Chip className={classNames({
                [classes.status]: true,
                [classes.open]: ticket.status === 'open' || ticket.status === 'new',
                [classes.closed]: ticket.status === 'closed',
              })}
              label={ticket.status} />
            </Typography>
          </Grid>
        </Grid>
        {ticket.entity && this.renderEntityLabelWithIcon()}
        <Grid container direction="column" justify="center" alignItems="center" className={classes.listParent} >
          {/* Display the contents of the ticket, followed by replies (if any) */}
          <ExpandableTicketPanel
            key={ticket!.id}
            ticket={ticket}
            isCurrentUser={profileUsername === ticket.opened_by}
          />
          {replies && this.renderReplies(replies)}
          {/* If the ticket is open, allow users to reply to it. */}
          {['open','new'].includes(ticket.status) &&
            <TicketReply 
              ticketId={ticketId!}
              onSuccess={this.onCreateReplySuccess}
            />
          }
        </Grid>
      </React.Fragment>
    )
  }
}

const reduceToUniqueGravatarIDs = (acc: string[], reply:Linode.SupportReply) => {
  const { gravatar_id } = reply;

  return acc.includes(gravatar_id) ? acc : [...acc, gravatar_id];
};

const requestAndMapGravatar = (acc: any, id: string) => {
  return getGravatarUrlFromHash(id)
    /* Map the response to a dict of { id: url }*/
    .then((result) => ({...acc, [id]: result }));
};

const styled = withStyles(styles, { withTheme: true });

const mapStateToProps = (state: Linode.AppState) => ({
  profileUsername: pathOr('', ['resources', 'profile', 'data', 'username'], state),
});

const matchGravatarURLToReply = (gravatarMap: {[ key: string]: string }) => (reply: Linode.SupportReply) =>
  ({ ...reply, gravatarUrl: pathOr('not found', [reply.gravatar_id], gravatarMap) });

export const connected = connect(mapStateToProps);

export default compose<any,any,any,any>(
  setDocs(SupportTicketDetail.docs),
  styled,
  connected,
)(SupportTicketDetail)
