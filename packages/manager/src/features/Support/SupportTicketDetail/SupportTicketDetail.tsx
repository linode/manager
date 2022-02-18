import {
  getTicket,
  getTicketReplies,
  SupportReply,
  SupportTicket,
} from '@linode/api-v4/lib/support';
import { APIError } from '@linode/api-v4/lib/types';
import * as Bluebird from 'bluebird';
import classNames from 'classnames';
import { compose, isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import Chip from 'src/components/core/Chip';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withProfile, { ProfileProps } from 'src/components/withProfile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';
import { getGravatarUrlFromHash } from 'src/utilities/gravatar';
import ExpandableTicketPanel from '../ExpandableTicketPanel';
import TicketAttachmentList from '../TicketAttachmentList';
import { ExtendedReply, ExtendedTicket } from '../types';
import AttachmentError from './AttachmentError';
import Reply from './TabbedReply';

export type ClassNames =
  | 'title'
  | 'breadcrumbs'
  | 'label'
  | 'labelIcon'
  | 'status'
  | 'open'
  | 'ticketLabel'
  | 'closed';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      display: 'flex',
      alignItems: 'center',
    },
    breadcrumbs: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(),
      },
    },
    label: {
      marginLeft: 32,
      width: `calc(100% - (32px + ${theme.spacing(7)}px))`,
      [theme.breakpoints.up('sm')]: {
        marginLeft: `calc(40px + ${theme.spacing(1)}px)`,
        width: `calc(100% - (40px + ${theme.spacing(7)}px))`,
      },
    },
    ticketLabel: {
      position: 'relative',
      top: -3,
    },
    labelIcon: {
      paddingRight: 0,
      '& svg': {
        width: 40,
        height: 40,
      },
      '& .outerCircle': {
        fill: theme.bg.offWhite,
        stroke: theme.bg.main,
      },
      '& .circle': {
        stroke: theme.bg.main,
      },
    },
    status: {
      marginTop: 5,
      marginLeft: theme.spacing(1),
      color: theme.color.white,
    },
    open: {
      backgroundColor: theme.color.green,
    },
    closed: {
      backgroundColor: theme.color.red,
    },
  });

type RouteProps = RouteComponentProps<{ ticketId?: string }>;

export interface AttachmentError {
  file: string;
  error: string;
}

interface State {
  loading: boolean;
  errors?: APIError[];
  attachmentErrors: AttachmentError[];
  replies?: ExtendedReply[];
  ticket?: ExtendedTicket;
  ticketCloseSuccess: boolean;
}

export type CombinedProps = RouteProps & ProfileProps & WithStyles<ClassNames>;

export class SupportTicketDetail extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    loading: true,
    ticketCloseSuccess: false,
    attachmentErrors: pathOr(
      [],
      ['history', 'location', 'state', 'attachmentErrors'],
      this.props
    ),
  };

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
    const { history, location } = this.props;
    this.loadTicketAndReplies();
    // Clear any state that was passed from React Router so errors don't persist after reload.
    history.replace(location.pathname, {});
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.match.params.ticketId !== this.props.match.params.ticketId) {
      this.setState({ loading: true, ticketCloseSuccess: false });
      this.loadTicketAndReplies();
    }
  }

  loadTicket = (): any => {
    const ticketId = Number(this.props.match.params.ticketId ?? 0);
    return getTicket(+ticketId);
  };

  loadReplies = (): any => {
    const ticketId = Number(this.props.match.params.ticketId ?? 0);
    return (
      getTicketReplies(ticketId)
        // This is a paginated method but here we only need the list of replies
        .then((response) => response.data)
    );
  };

  reloadAttachments = () => {
    this.loadTicket().then((ticket: SupportTicket) => {
      this.setState({
        ticket: {
          ...this.state.ticket!,
          attachments: ticket.attachments,
        },
        ticketCloseSuccess: false,
      });
    });
  };

  closeTicketSuccess = () => {
    this.setState({ ticketCloseSuccess: true });
    this.loadTicketAndReplies();
  };

  handleJoinedPromise = (
    ticketResponse: SupportTicket,
    replyResponse: SupportReply[]
  ) => {
    /** Gets a unique list of gravatar IDs */
    const uniqueGravatarIDs = replyResponse.reduce(reduceToUniqueGravatarIDs, [
      ticketResponse.gravatar_id,
    ]);

    /** Send a request for the gravatar for each unique ID. */
    return Bluebird.reduce(uniqueGravatarIDs, requestAndMapGravatar, {}).then(
      (gravatarMap) => {
        /** We now have the gravatar map from the reducer above, and the replies from further up,
         * so we can merge them together.
         */
        if (this.mounted) {
          this.setState({
            replies: replyResponse.map(matchGravatarURLToReply(gravatarMap)),
            ticket: {
              ...ticketResponse,
              gravatarUrl: gravatarMap[ticketResponse.gravatar_id],
            },
            loading: false,
          });
        }
      }
    );
  };

  loadTicketAndReplies = () => {
    Bluebird.join(
      this.loadTicket(),
      this.loadReplies(),
      this.handleJoinedPromise
    ).catch((err) => {
      this.setState({
        loading: false,
        errors: getAPIErrorOrDefault(err, 'Ticket not found.'),
      });
    });
  };

  onCreateReplySuccess = (newReply: SupportReply) => {
    const replies = pathOr([], ['replies'], this.state);
    getGravatarUrlFromHash(newReply.gravatar_id).then((url) => {
      const replyWithGravatar: ExtendedReply = {
        ...newReply,
        gravatarUrl: url,
      };
      const updatedReplies = [...replies, ...[replyWithGravatar]];
      this.setState({
        replies: updatedReplies,
        ticketCloseSuccess: false,
        attachmentErrors: [],
      });
    });
  };

  getEntityIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <DomainIcon />;
      case 'linode':
        return <LinodeIcon />;
      case 'nodebalancer':
        return <NodebalIcon />;
      case 'volume':
        return <VolumeIcon />;
      default:
        return <LinodeIcon />;
    }
  };

  renderEntityLabelWithIcon = () => {
    const { classes } = this.props;
    const { entity } = this.state.ticket!;
    if (!entity) {
      return null;
    }
    const icon: JSX.Element = this.getEntityIcon(entity.type);
    const target = getLinkTargets(entity);
    return (
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
        className={classes.label}
      >
        <Grid item className={classes.labelIcon}>
          {icon}
        </Grid>
        <Grid item className="p0">
          {target !== null ? (
            <Link
              to={target}
              className={`${classes.ticketLabel} secondaryLink`}
            >
              {entity.label}
            </Link>
          ) : (
            <Typography className={classes.ticketLabel}>
              {entity.label}
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  renderReplies = (replies: ExtendedReply[]) => {
    const { ticket } = this.state;
    return replies
      .filter((reply) => reply.description.trim() !== '')
      .map((reply: ExtendedReply, idx: number) => {
        return (
          <ExpandableTicketPanel
            key={idx}
            reply={reply}
            open={idx === replies.length - 1}
            parentTicket={ticket ? ticket.id : undefined}
            ticketUpdated={ticket ? ticket.updated : ''}
            isCurrentUser={
              this.props.profile.data?.username === reply.created_by
            }
          />
        );
      });
  };

  render() {
    const { classes, profile, location } = this.props;
    const {
      attachmentErrors,
      errors,
      loading,
      replies,
      ticket,
      ticketCloseSuccess,
    } = this.state;
    const ticketId = this.props.match.params.ticketId;
    /*
     * Including loading/error states here (rather than in a
     * renderContent function) because the header
     * depends on having a ticket object for its content.
     */

    // Loading
    if (loading) {
      return <CircleProgress />;
    }

    // Error state
    if (errors) {
      return <ErrorState errorText={errors[0].reason} />;
    }

    // Empty state
    if (!ticket) {
      return null;
    }

    // Format date for header
    const formattedDate = formatDate(ticket.updated);

    const _Chip = () => (
      <Chip
        className={classNames({
          [classes.status]: true,
          [classes.open]: ticket.status === 'open' || ticket.status === 'new',
          [classes.closed]: ticket.status === 'closed',
        })}
        label={ticket.status}
        component="div"
        role="term"
      />
    );

    // Might be an opportunity to refactor the nested grid containing the ticket summary, status, and last updated
    // details.  For more info see the below link.
    // https://github.com/linode/manager/pull/4056/files/b0977c6e397e42720479478db96df56022618151#r232298065
    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Support Ticket ${ticketId}`} />
        <Grid container justifyContent="space-between" alignItems="flex-end">
          <Grid item>
            <Breadcrumb
              pathname={location.pathname}
              crumbOverrides={[
                {
                  position: 2,
                  linkTo: {
                    pathname: `/support/tickets`,
                    // If we're viewing a `Closed` ticket, the Breadcrumb link should take us to `Closed` tickets.
                    search: `type=${
                      ticket.status === 'closed' ? 'closed' : 'open'
                    }`,
                  },
                },
              ]}
              labelTitle={`#${ticket.id}: ${ticket.summary}`}
              labelOptions={{
                subtitle: `${
                  ticket.status === 'closed' ? 'Closed' : 'Last updated'
                } by ${ticket.updated_by} at ${formattedDate}`,
                suffixComponent: <_Chip />,
              }}
              className={classes.breadcrumbs}
              data-qa-breadcrumb
            />
          </Grid>
        </Grid>

        {/* If a user attached files when creating the ticket and was redirected here, display those errors. */}
        {!isEmpty(attachmentErrors) &&
          attachmentErrors.map((error, idx: number) => (
            <AttachmentError
              key={idx}
              fileName={error.file}
              reason={error.error}
            />
          ))}

        {ticket.entity && this.renderEntityLabelWithIcon()}

        {/* Show message if the ticket has been closed through the link on this page. */}
        {ticketCloseSuccess && (
          <Notice success text={'Ticket has been closed.'} />
        )}

        <Grid container>
          <Grid item xs={12}>
            {/* If the ticket isn't blank, display it, followed by replies (if any). */}
            {ticket.description && (
              <ExpandableTicketPanel
                key={ticket.id}
                ticket={ticket}
                isCurrentUser={profile.data?.username === ticket.opened_by}
              />
            )}
            {replies && this.renderReplies(replies)}
            <TicketAttachmentList attachments={ticket.attachments} />
            {/* If the ticket is open, allow users to reply to it. */}
            {['open', 'new'].includes(ticket.status) && (
              <Reply
                ticketId={ticket.id}
                closable={ticket.closable}
                onSuccess={this.onCreateReplySuccess}
                reloadAttachments={this.reloadAttachments}
                closeTicketSuccess={this.closeTicketSuccess}
                lastReply={replies && replies[replies.length - 1]}
              />
            )}
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </React.Fragment>
    );
  }
}

const reduceToUniqueGravatarIDs = (acc: string[], reply: SupportReply) => {
  const { gravatar_id } = reply;

  return acc.includes(gravatar_id) ? acc : [...acc, gravatar_id];
};

const requestAndMapGravatar = (acc: any, id: string) => {
  return (
    getGravatarUrlFromHash(id)
      /* Map the response to a dict of { id: url }*/
      .then((result) => ({ ...acc, [id]: result }))
  );
};

const styled = withStyles(styles);

const matchGravatarURLToReply = (gravatarMap: { [key: string]: string }) => (
  reply: SupportReply
): ExtendedReply => ({
  ...reply,
  gravatarUrl: pathOr('not found', [reply.gravatar_id], gravatarMap),
});

export default compose<any, any, any, any>(
  setDocs(SupportTicketDetail.docs),
  withProfile,
  styled
)(SupportTicketDetail);
