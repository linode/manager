import * as Bluebird from 'bluebird';
import * as classNames from 'classnames';
import { compose, concat, path, pathOr, slice } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import InsertPhoto from '@material-ui/icons/InsertPhoto';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import { getTicket, getTicketReplies } from 'src/services/support';
import formatDate from 'src/utilities/formatDate';
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
  | 'ticketLabel'
  | 'closed'
  | 'attachmentPaperWrapper'
  | 'attachmentPaper'
  | 'attachmentRow'
  | 'attachmentIcon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '8px',
    marginBottom: '8px'
  },
  backButton: {
    margin: '-6px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
    padding:0
  },
  label: {
    marginBottom: theme.spacing.unit,
  },
  ticketLabel: {
    position: 'relative',
    top: -3,
  },
  labelIcon: {
    paddingRight: 0,
    '& .outerCircle': {
      fill: theme.bg.offWhiteDT,
      stroke: theme.bg.main,
    },
    '& .circle': {
      stroke: theme.bg.main,
    },
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
  attachmentPaperWrapper: {
    overflowX: 'auto',
  },
  attachmentPaper: {
    padding: `
      12px
      ${theme.spacing.unit * 3}px
      0
    `,
    overflowX: 'auto',
    width: 500,
  },
  attachmentRow: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: 12,
    '&:last-child': {
      marginBottom: 0,
      border: 0,
    },
  },
  attachmentIcon: {
    paddingLeft: `0 !important`,
    color: theme.palette.text.primary,
  },
});

type RouteProps = RouteComponentProps<{ ticketId?: number }>;

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  replies?: Linode.SupportReply[];
  ticket?: Linode.SupportTicket;
  ticketCloseSuccess: boolean;
  showMoreAttachments: boolean;
}

type CombinedProps = RouteProps & StateProps & WithStyles<ClassNames>;

export class SupportTicketDetail extends React.Component<CombinedProps,State> {
  mounted: boolean = false;
  state: State = {
    loading: true,
    showMoreAttachments: false,
    ticketCloseSuccess: false,
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

  componentDidUpdate(prevProps:CombinedProps, prevState:State) {
    if (prevProps.match.params.ticketId !== this.props.match.params.ticketId) {
      this.setState({ loading: true, ticketCloseSuccess: false });
      this.loadTicketAndReplies();
    }
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
      // This is a paginated method but here we only need the list of replies
      .then(response => response.data);
  }

  reloadAttachments = () => {
    this.loadTicket()
      .then((ticket: Linode.SupportTicket) => {
        this.setState({
          ticket: {
            ...this.state.ticket!,
            attachments: ticket.attachments,
            ticketCloseSuccess: false,
          },
        });
      });
  }

  closeTicketSuccess = () => {
    this.setState({ ticketCloseSuccess: true });
    this.loadTicketAndReplies();
  }

  handleJoinedPromise = (ticketResponse: Linode.SupportTicket, replyResponse: Linode.SupportReply[]) => {
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
        })
      });
  };

  loadTicketAndReplies = () => {
    Bluebird.join(this.loadTicket(), this.loadReplies(), this.handleJoinedPromise)
      .catch((err) => {
        const error = [{ "reason": "Ticket not found." }]
        this.setState({ loading: false, errors: pathOr(error, ['response', 'data', 'errors'], err)});
      });
  }

  onCreateReplySuccess = (newReply:Linode.SupportReply) => {
    const replies = pathOr([], ['replies'], this.state);
    getGravatarUrlFromHash(newReply.gravatar_id)
      .then((url) => {
        newReply.gravatarUrl = url;
        const updatedReplies = concat(replies, [newReply]);
        this.setState({
          replies: updatedReplies,
          ticketCloseSuccess: false,
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
          <Typography className={classes.ticketLabel}>{label}</Typography>
        </Grid>
      </Grid>
    )
  }

  renderAttachments = (attachments: string[]) => {
    const { classes } = this.props;

    // create an array of icons to use
    const icons = attachments.map((attachment, idx) => {
      // try to find a file extension
      const lastDotIndex = attachment.lastIndexOf('.');
      const ext = attachment.slice(lastDotIndex + 1);
      if (ext) {
        if (['jpg', 'jpeg', 'png', 'bmp', 'tiff'].includes(ext.toLowerCase())) {
          return <InsertPhoto key={idx} />;
        }
      }
      return <InsertDriveFile key={idx} />;
    })
    return (
      <React.Fragment>
        {attachments.length !== 0 &&
          <Grid item xs={12} container justify="flex-start" className="px0">
            <Grid item xs={12}>
              <Typography variant="subheading">Attachments</Typography>
            </Grid>
            <Grid item xs={12} className={classes.attachmentPaperWrapper}>
              {this.renderAttachmentsRows(slice(0, 5, attachments), icons)}
              {
                (attachments.length > 5) &&
                <div onClick={this.toggleShowMoreAttachments} style={{ display: 'inline-block' }}>
                  <ShowMoreExpansion
                    name={!this.state.showMoreAttachments
                      ? "Show More Files"
                      : "Show Less Files"
                    }
                  >
                    {this.renderAttachmentsRows(slice(5, Infinity, attachments), icons)}
                  </ShowMoreExpansion>
                </div>
              }
            </Grid>
          </Grid>
        }
      </React.Fragment>
    );
  }

  toggleShowMoreAttachments = () => {
    this.setState({ showMoreAttachments: !this.state.showMoreAttachments, ticketCloseSuccess: false });
  }

  renderAttachmentsRows = (attachments: string[], icons: JSX.Element[]) => {
    const { classes } = this.props;
    return (
      <Paper className={classes.attachmentPaper}>
        {attachments.map((attachment, idx) => {
          return (
            <Grid container wrap="nowrap" key={idx} className={classes.attachmentRow}>
              <Grid item className={classes.attachmentIcon}>
                {icons[idx]}
              </Grid>
              <Grid item>
                <Typography component="span">
                  {attachment}
                </Typography>
              </Grid>
            </Grid>
          )
        })}
      </Paper>
    )
  }

  renderReplies = (replies: Linode.SupportReply[]) => {
    const { ticket } = this.state;
    return replies.filter((reply => reply.description.trim() !== ''))
      .map((reply: Linode.SupportReply, idx: number) => {
      return <ExpandableTicketPanel
        key={idx}
        reply={reply}
        open={idx === replies.length - 1}
        parentTicket={ticket ? ticket.id : undefined}
        ticketUpdated={ticket ? ticket.updated : ''}
        isCurrentUser={this.props.profileUsername === reply.created_by}
      />
    });
  }

  render() {
    const { classes, profileUsername, timezone } = this.props;
    const { errors, loading, replies, ticket, ticketCloseSuccess } = this.state;
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

    // Format date for header
    const formattedDate = formatDate(ticket.updated, { timezone });

    // Might be an opportunity to refactor the nested grid containing the ticket summary, status, and last updated
    // details.  For more info see the below link.
    // https://github.com/linode/manager/pull/4056/files/b0977c6e397e42720479478db96df56022618151#r232298065
    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Support Ticket ${ticketId}`} />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8, marginBottom: 8 }}>
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo={{
                pathname: '/support/tickets',
                // If the ticket is "open" or "new", the "Open Tickets" tab
                // should be active on when we go back to SupportTicketsLanding
                state: { openFromRedirect: ['open','new'].includes(ticket.status) }
              }}
              linkText="Support Tickets"
              labelTitle={`#${ticket.id}: ${ticket.summary}`}
              labelSubtitle={
                `${ticket.status === 'closed' ? 'Closed' : 'Last updated'} by ${ticket.updated_by} at ${formattedDate}`
              }
              data-qa-breadcrumb
            />
            <Chip className={classNames({
              [classes.status]: true,
              [classes.open]: ticket.status === 'open' || ticket.status === 'new',
              [classes.closed]: ticket.status === 'closed',
            })}
            label={ticket.status} />
          </Grid>
        </Grid>

        {ticket.entity && this.renderEntityLabelWithIcon()}

        {/* Show message if the ticket has been closed through the link on this page. */}
        {ticketCloseSuccess && <Notice success text={"Ticket has been closed."}/>}

        <Grid container direction="column" justify="center" alignItems="center" className={classes.listParent} >
          {/* If the ticket isn't blank, display it, followed by replies (if any). */}
          {ticket.description &&
            <ExpandableTicketPanel
              key={ticket.id}
              ticket={ticket}
              isCurrentUser={profileUsername === ticket.opened_by}
            />
          }
          {replies && this.renderReplies(replies)}
          {ticket.attachments.length > 0 && this.renderAttachments(ticket.attachments)}
          {/* If the ticket is open, allow users to reply to it. */}
          {['open','new'].includes(ticket.status) &&
            <TicketReply
              ticketId={ticket.id}
              closable={ticket.closable}
              onSuccess={this.onCreateReplySuccess}
              reloadAttachments={this.reloadAttachments}
              closeTicketSuccess={this.closeTicketSuccess}
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

interface StateProps {
  timezone: string;
  profileUsername?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => ({
  timezone: pathOr('GMT', ['data', 'timezone'], state.__resources.profile),
  profileUsername: path(['data', 'username'], state.__resources.profile)
});

const matchGravatarURLToReply = (gravatarMap: {[ key: string]: string }) => (reply: Linode.SupportReply) =>
  ({ ...reply, gravatarUrl: pathOr('not found', [reply.gravatar_id], gravatarMap) });

export const connected = connect(mapStateToProps);

export default compose<any,any,any,any>(
  setDocs(SupportTicketDetail.docs),
  styled,
  connected,
)(SupportTicketDetail)
